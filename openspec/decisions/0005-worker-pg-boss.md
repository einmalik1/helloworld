# 0005 — Worker jobs with pg-boss

## Status

Accepted (spec-baseline)

## Context

Impex and other long work must not block API HTTP. OpenSpec: `worker-jobs`, `impex`.

## Decision

- Job queue: **pg-boss** on **PostgreSQL** (no Redis required for template jobs).
- Runtime: **Nest** standalone worker (`apps/worker`), same Nest major line as the API.
- API enqueues / returns **`202`** + identifiers; worker executes and updates run/job state.
- Worker exposes **`GET /health`** (`@Public()`) and operator job HTTP (list/status/retry) for CLI/TUI.

## Consequences

- Worker needs `DATABASE_URL` (and S3 when jobs touch files).
- Orval second client for worker OpenAPI is optional later; product impex UX prefers API run endpoints.

## Rejected

- Redis-mandatory queue for the template.
- Sync-only processing of large imports on the API request thread as the default.
