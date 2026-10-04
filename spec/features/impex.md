# Impex (Import / Export)

Generic, cross-cutting capability: every persistent domain resource that participates in the REST API can be **imported** from and **exported** to files via object storage and background jobs.

This spec defines the **pattern**. Per-entity formats and field mapping live in (or next to) that entity’s feature spec; they do not invent a second pipeline.

## Goal

- Operators and clients can bulk-load and bulk-extract domain data without long-running HTTP requests on the API.
- Large work runs as **jobs** on the worker; files live in **S3-compatible object storage**; the API owns auth, upload/download, and starting jobs.

## Scope

**In scope**

- Generic import and export job types driven by a resource name (entity / aggregate).
- Upload of import payloads and download of export artifacts via the API + object storage.
- Job lifecycle visible to clients (create, list, status, optional manual re-trigger).
- Idempotent-enough handling for retries (same job run must not silently double-apply without rules).
- Applies by default to catalog resources backed by `schema.sql` tables that expose a normal CRUD API (e.g. `person`, `channel`, `greeting`, `greeting_reaction`), unless a feature explicitly opts out.

**Out of scope (for this generic feature)**

- Entity-specific column/format details (CSV headers, JSON shape) — per feature or generated contract.
- External event bus / webhooks (separate integration topic).
- Real-time streaming sync protocols.
- Bidirectional continuous replication with external systems.

## Components and responsibilities

| Component | Responsibility |
|---|---|
| **API** (`apps/api`) | Authenticate; validate request; accept or authorize upload of import file to object storage; create import/export **run** (domain record and/or enqueue); return `202` + identifiers; authorize download (presigned URL or proxied stream); expose run status that clients need for product UX. |
| **Worker** (`apps/worker`) | Execute import/export **jobs** (parse, validate with Zod/domain rules, write via DB, write export file to object storage); update job/run progress and terminal state; expose job-control HTTP for operators (list/status/trigger) in addition to `/health`. |
| **Object storage** (`infra/s3` / Garage) | Store import uploads and export artifacts; not processed inside the API request beyond upload handshake. |
| **Queue** (pg-boss on PostgreSQL) | Durable job execution, retries, concurrency limits. |
| **Clients** (web, CLI, TUI) | Call API for impex runs and file access; TUI/CLI may also use worker job HTTP for operational job views. |

## High-level flows

### Import

1. Client obtains upload capability from the API (presigned PUT/POST or multipart upload endpoint).
2. Client uploads the file to object storage.
3. Client calls API: start import for resource `R` with storage key + format options → API enqueues worker job → **`202`** with `runId` / `jobId`.
4. Worker loads the object, validates rows/documents, applies domain writes (create/update per resource rules), records progress/errors.
5. Client polls API (and/or worker job API) until `succeeded` / `failed` / `cancelled`; error report may be another object in storage or inline summary.

### Export

1. Client calls API: start export for resource `R` with filters/format → API enqueues job → **`202`** with `runId` / `jobId`.
2. Worker queries domain data, writes artifact to object storage, marks run complete with object key.
3. Client downloads via API (presigned GET or authenticated download endpoint).

### Small / synchronous exception (optional later)

Tiny payloads may be handled synchronously on the API only if explicitly allowed per resource and bounded (size/row caps). Default for the template: **always async via worker**.

## Job model (intent)

Logical run states (names may map to pg-boss states + a domain `impex_run` table when modeled in ERD):

| State | Meaning |
|---|---|
| `queued` | Accepted, not started |
| `running` | Worker processing |
| `succeeded` | Finished; export object ready or import applied |
| `failed` | Terminal failure; error summary available |
| `cancelled` | Stopped by operator (if supported) |

Minimum observables: resource name, direction (`import` \| `export`), format, timestamps, progress (optional: rows processed / total), error summary, storage key(s).

**Partial failure (template default):** continue processing after row errors; write an error artifact when useful; mark the run **`failed` if any row error**. A softer `succeeded_with_errors` state may be introduced later via ADR.

## API surface (intent — resource-oriented)

Concrete paths can follow Nest conventions; shape:

| Method | Path (example) | Role |
|---|---|---|
| `POST` | `/impex/{resource}/imports` | Start import (body: object key, format, options) → `202` |
| `POST` | `/impex/{resource}/exports` | Start export (body: filters, format) → `202` |
| `GET` | `/impex/runs/{runId}` | Run status (product-facing) |
| `GET` | `/impex/runs` | List runs (filter by resource/direction) |
| `GET` | `/impex/runs/{runId}/download` | Download export (or redirect to presigned URL) |
| `POST` | `/impex/uploads` | Create upload slot / presigned URL for import files |

Auth: same as API (session and/or Better Auth API key). No anonymous impex.

## Worker surface (intent — operations)

| Method | Path (example) | Role |
|---|---|---|
| `GET` | `/health` | Liveness (`@Public()`) |
| `GET` | `/jobs` | List jobs (incl. impex) |
| `GET` | `/jobs/{id}` | Job detail / status |
| `POST` | `/jobs/{id}/retry` | Manual re-trigger (idempotency rules apply) |

Job HTTP is for operators/CLI/TUI; web product flows prefer the API run endpoints.

## Formats

- Template baseline: **JSON** (aligned with API Zod / OpenAPI shapes) and **CSV** (one row per entity; nested relations either flattened or out of scope per resource).
- Validation: reuse `@helloworld/types` (entity / API schemas) where possible; import rows that fail validation are reported, not silently coerced past schema.

## Concurrency and consistency

- API and worker may both use the domain DB; no in-process domain cache as source of truth.
- Import jobs should be **idempotent where practical** (e.g. upsert by natural/business key when the resource defines one; otherwise document create-only vs upsert).
- Prefer transactions per batch; see partial-failure default above.

## Acceptance criteria

1. Starting an import or export returns quickly (`202`) and does not require the HTTP request to stay open until the file is fully processed.
2. Import files are read from object storage by the worker, not held only in API memory for the whole job.
3. Export artifacts are written to object storage by the worker and downloaded through the API (presigned or authenticated), not streamed as an unbounded sync response from the worker to the browser by default.
4. A client can observe run/job status until a terminal state.
5. Unauthorized callers cannot start impex or download artifacts.
6. At least one resource from the Hello World model can exercise the full import and export path end-to-end (template spike); remaining resources follow the same pattern.
7. CLI/TUI can list job status and manually retry a failed impex job via the worker job API (or equivalent documented path).

## Non-goals / explicit defaults

- No Redis required for impex (queue = PostgreSQL / pg-boss).
- MCP does not talk to the DB for impex; if agents need impex, they call the **API** with a token (same as other domain tools).
- External “event bus” is not required for impex completion notifications in v1 (polling is enough); optional webhook-on-complete can be a later job type.

## Related

- Architecture boundaries: [`../architecture.md`](../architecture.md)
- Stack (API, worker, S3, queue): [`../tech-stack.md`](../tech-stack.md)
- DDL: [`../erd/schema.sql`](../erd/schema.sql) — add `impex_run` (or equivalent) when the data model is extended
- Per-entity behaviour: sibling files under `spec/features/`
