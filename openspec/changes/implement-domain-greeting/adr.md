# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-10
- Reviewer: developer worker (issue #44)
- Change: implement-domain-greeting

## In-Force ADR Context Reviewed

- `openspec/decisions/0001-schema-migrations.md` — no Nest runtime DDL; use existing greeting table from migrations.
- `openspec/decisions/0002-api-http-contract.md` — Problem Details, list envelope, PATCH/DELETE semantics; Nest controller maps platform Results into this contract.
- `openspec/decisions/0003-better-auth.md` — global AuthGuard; greeting routes authenticated (not `@Public()`).
- `openspec/decisions/0004-platform-facade-mcp.md` — API calls greeting use-cases via `@helloworld/platform` in-process; this change implements that for greeting.
- `openspec/decisions/0005-worker-pg-boss.md`, `0006-search-knowledge-graph.md`, `0007-worker-schedule-not-pg-boss.md` — reviewed; out of scope.

## Repository-Level ADRs Created

- None: facade and HTTP contract already recorded; this change wires greeting CRUD to those decisions.

## Notes

Ticket explicitly: do not re-open facade ADRs 0001–0006.
