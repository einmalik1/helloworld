# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-11
- Reviewer: developer worker (issue #48)
- Change: implement-impex

## In-Force ADR Context Reviewed

- `openspec/decisions/0001-schema-migrations.md` — no Nest runtime DDL; `impex_run` via migrate.
- `openspec/decisions/0002-api-http-contract.md` — Problem Details; `202` acceptance for start; auth errors as today.
- `openspec/decisions/0003-better-auth.md` — impex routes authenticated; no anonymous upload/download.
- `openspec/decisions/0004-object-storage.md` / platform facade — worker + API use ObjectStorage adapter; no new storage product.
- `openspec/decisions/0005-worker-pg-boss.md` — **superseded** by 0007; historical only.
- `openspec/decisions/0006-search-knowledge-graph.md` — out of scope for this change.
- `openspec/decisions/0007-worker-schedule-not-pg-boss.md` — impex jobs use schedule + Postgres `job` rows.
- `openspec/decisions/0008-chat-service-app.md` — out of scope.

## Repository-Level ADRs Created

- None: impex wiring follows existing ADRs (0002, 0003, 0004, 0007). Authenticated API put/get instead of presign is a tactical spike choice, not a durable cross-change commitment requiring a new ADR.

## Notes

Ticket focus: API runs + worker jobs + one resource E2E (`person` JSON).
