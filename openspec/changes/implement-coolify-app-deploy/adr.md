# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-15
- Reviewer: developer worker (issue #63)
- Change: implement-coolify-app-deploy

## In-Force ADR Context Reviewed

- `openspec/decisions/0001-schema-migrations.md` — migrate path stays `pnpm db:migrate` / Drizzle; Coolify uses same.
- `openspec/decisions/0002-api-http-contract.md` — `/health` remains public probe for Coolify.
- `openspec/decisions/0003-better-auth.md` — auth secrets via Coolify env, not static `API_KEY`.
- `openspec/decisions/0004-platform-facade-mcp.md` — mcp image stays HTTP→api only.
- `openspec/decisions/0005-worker-pg-boss.md` / `0007-worker-schedule-not-pg-boss.md` — worker image unchanged in job backend.
- `openspec/decisions/0006-search-knowledge-graph.md` — AGE/Typesense Coolify pins deferred; blockers documented.
- `openspec/decisions/0008-chat-service-app.md` — chat Application deferred (not in app plane).

## Repository-Level ADRs Created

- None: Coolify Dockerfile stage contract and deploy topology are already normative in `openspec/tech-stack.md`; this change implements them.

## Notes

No durable architectural decision beyond tech-stack; no supersession.
