## Context

`#46` shipped platform S3 + `ObjectStorageModule` (API already imports it). `#47` shipped Nest `apps/worker` with `@nestjs/schedule`, `job`/`outbox` tables, and operator job HTTP. Ticket `#48` / backlog focus: **API impex runs + worker jobs + one resource E2E**.

In-force ADRs: **0001** (no Nest runtime DDL), **0002** (Problem Details / HTTP contract), **0003** (Better Auth), **0004** (platform S3 facade), **0006** (search — out of scope), **0007** (schedule + Postgres jobs, not pg-boss), **0008** (chat — out of scope). ADR **0005** superseded by 0007.

## Goals / Non-Goals

**Goals:**

- Product API: upload → start import/export (`202`) → poll runs → download export.
- Worker interval job processes `impex.import` / `impex.export` job types using ObjectStorage + Drizzle.
- Durable `impex_run` rows linked to `job.id`.
- `person` + JSON format E2E spike (upsert by email).
- Smoke green for api + worker (+ modules if schema touched) without Coolify.

**Non-Goals:**

- Presigned URLs (`@aws-sdk/s3-request-presigner`) — authenticated API put/get is enough for v1 spike.
- CSV format, remaining catalog resources, CLI/TUI/MCP impex UX.
- Webhooks / event bus; pg-boss; Redis.
- Re-opening ADRs 0001–0008.

## Decisions

1. **`impex_run` platform table** (hand-authored Drizzle next to `job`/`outbox`, not `schema.sql`):
   - Columns: `id`, `resource`, `direction` (`import`|`export`), `format`, `status`, `object_key`, `error_summary`, `job_id` (FK-ish uuid to `job`), `rows_total`, `rows_error`, timestamps.
   - Avoids Nest DTO/Orval CRUD stubs; API uses a hand-written ImpexModule.
   - Migration via `pnpm db:generate`.

2. **API surface** (`apps/api/src/impex/`):
   - `POST /impex/uploads` — raw/body or multipart → `ObjectStorageService.putObject` under `impex/uploads/{uuid}` → `{ objectKey }`.
   - `POST /impex/:resource/imports` — body `{ objectKey, format }` → create `impex_run` + `job` (`type=impex.import`, status queued) → `202` `{ runId, jobId }`.
   - `POST /impex/:resource/exports` — body `{ format }` → same with `impex.export`.
   - `GET /impex/runs`, `GET /impex/runs/:runId`, `GET /impex/runs/:runId/download` (stream from S3 when succeeded export).
   - Auth: global guard (not `@Public()`). Unsupported resource/format → 400 Problem Details.

3. **Worker**:
   - Import `ObjectStorageModule`; merge `s3EnvFields` into worker `envSchema`.
   - `ImpexJob` `@Interval` (~5s): claim queued jobs where `type` starts with `impex.`; mark running; execute; update job + impex_run.
   - Person JSON import: parse array, `CreatePersonSchema` per row, upsert on `email`.
   - Person JSON export: select all persons → put JSON array → set run `object_key`.
   - Partial failure default: any row error → run `failed` with summary; continue processing remaining rows when practical.

4. **Job ↔ run linkage**: API creates job first (or in one transaction), stores `job_id` on `impex_run`; job payload includes `{ runId, resource, direction, format, objectKey? }`. Retry via existing `POST /jobs/:id/retry` re-queues the job; worker re-reads payload.

5. **Smoke**:
   - API: extend http-contract smoke — unauthenticated impex routes → 401; AppModule imports ImpexModule.
   - Worker: override ObjectStorage + JobsRepository; assert ImpexJob registered with ScheduleRegistry (or provider present).
   - Optional unit test for person JSON apply helper with mocked db/storage (no Coolify).

6. **OpenAPI**: Tag impex controller; regenerate client only if export script is already in the smoke/dev path — prefer documenting paths; full Orval regen if `openapi:export` is cheap and expected by conventions.

## Risks / Trade-offs

- **[Risk] Live S3/DB needed for true E2E** → Mitigation: package smoke uses mocks; document Coolify Garage + migrate for integration plane.
- **[Trade-off] No presign** → Upload proxied through API; fine for template spike sizes.
- **[Trade-off] Only person JSON** → Spec allows unsupported for others; pattern is clear to copy.
- **[Risk] Race between API insert and worker claim** → Mitigation: job status `queued` + `FOR UPDATE SKIP LOCKED` or single-worker claim by `status=queued` update.

## Migration Plan

1. Land `impex_run` migration + API/worker code on automation branch; `pnpm db:migrate` on Coolify test before deploy.
2. Ensure api/worker Coolify apps have `S3_*` (already documented for Garage).
3. Rollback: revert app code; drop `impex_run` migration if needed.

## Open Questions

- None blocking. Presign can land later without an ADR if it stays an adapter helper under ADR 0004.
