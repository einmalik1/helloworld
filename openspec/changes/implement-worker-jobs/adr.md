# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-11
- Reviewer: developer worker (issue #47)
- Change: implement-worker-jobs

## In-Force ADR Context Reviewed

- `openspec/decisions/0001-schema-migrations.md` — no Nest runtime DDL; job/outbox via migrate.
- `openspec/decisions/0002-api-http-contract.md` — Problem Details for worker HTTP errors where applicable; no OpenAPI on worker.
- `openspec/decisions/0003-better-auth.md` — operator job routes use Better Auth / `x-api-key`; `/health` public.
- `openspec/decisions/0004-object-storage.md` — reviewed; impex file I/O out of scope for this change.
- `openspec/decisions/0005-worker-pg-boss.md` — **superseded** by 0007; historical only; do not depend on pg-boss.
- `openspec/decisions/0006-search-knowledge-graph.md` — outbox drain stub only; no AGE/Typesense sync here.
- `openspec/decisions/0007-worker-schedule-not-pg-boss.md` — **implements** schedule + Postgres work state; does not reopen.

## Repository-Level ADRs Created

- None: ADR 0007 already records the worker job model; this change wires Nest scaffolding to that decision.

## Notes

Ticket explicitly: Worker uses `@nestjs/schedule` (ADR 0007), not pg-boss.
