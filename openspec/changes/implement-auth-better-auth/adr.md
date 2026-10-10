# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-10
- Reviewer: developer worker (issue #41)
- Change: implement-auth-better-auth

## In-Force ADR Context Reviewed

- `openspec/decisions/0001-schema-migrations.md` — auth tables remain Better Auth CLI–owned; this change does not alter `schema.sql` or Nest runtime DDL.
- `openspec/decisions/0002-api-http-contract.md` — reviewed; Problem Details filter unchanged.
- `openspec/decisions/0003-better-auth.md` — sessions + managed API keys; header `x-api-key`; hand-written Nest wiring; no static env `API_KEY`. This change **implements** routes/guard/api-client header wiring; does not reopen.
- `openspec/decisions/0004-object-storage.md`, `0005-worker-pg-boss.md`, `0006-search-knowledge-graph.md`, `0007-worker-schedule-not-pg-boss.md`, `0008-chat-service-app.md` — reviewed; not in scope.

## Repository-Level ADRs Created

- None: no major durable architectural decisions were introduced. ADR 0003 already records the auth model; this change wires routes, guards, and the api-client mutator to that decision.

## Notes

Ticket explicitly: do not re-open facade ADRs 0001–0006.
