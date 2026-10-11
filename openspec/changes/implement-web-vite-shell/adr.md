# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-11
- Reviewer: developer worker (issue #50)
- Change: implement-web-vite-shell

## In-Force ADR Context Reviewed

- `openspec/decisions/0001-schema-migrations.md` — not in scope (no schema work).
- `openspec/decisions/0002-api-http-contract.md` — web/api-client consume HTTP contract; do not reopen.
- `openspec/decisions/0003-better-auth.md` — browser cookie sessions + `x-api-key` for machines; shell uses cookies; api-client mutator keeps header contract.
- `openspec/decisions/0004-platform-facade-mcp.md` — web uses api-client HTTP, not platform in-process.
- `openspec/decisions/0005-worker-pg-boss.md`, `0006-search-knowledge-graph.md`, `0007-worker-schedule-not-pg-boss.md` — reviewed; graph UI deferred.
- `openspec/decisions/0008-chat-service-app.md` — web is client of `apps/chat`; no vendor LLM in browser.

## Repository-Level ADRs Created

- None: Vite/React/Tailwind/shadcn/Orval+ky and chat boundary are already recorded in tech-stack + ADR 0003/0008. This change implements those decisions; no new durable architectural commitment.

## Notes

Ticket explicitly: do not re-open facade ADRs 0001–0006.
