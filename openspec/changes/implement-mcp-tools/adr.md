# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-11
- Reviewer: developer worker (issue #49)
- Change: implement-mcp-tools

## In-Force ADR Context Reviewed

- `openspec/decisions/0001-schema-migrations.md` — MCP must not run DDL or touch DB; domain writes go through API.
- `openspec/decisions/0002-api-http-contract.md` — MCP forwards Problem Details / status from API responses to tool errors; does not invent a second error model.
- `openspec/decisions/0003-better-auth.md` — service credential is a Better Auth managed API key via `x-api-key`; no static product `API_KEY`.
- `openspec/decisions/0004-platform-facade-mcp.md` — reviewed; ticket forbids re-opening. Product MCP transport is HTTP→API per tech-stack / app README / this change’s delta spec; platform remains API’s in-process facade.
- `openspec/decisions/0005-worker-pg-boss.md`, `0006-search-knowledge-graph.md`, `0007-worker-schedule-not-pg-boss.md`, `0008-chat-service-app.md` — reviewed; not in scope (no search/graph tools, no worker, no chat).

## Repository-Level ADRs Created

- None: transport choice is already recorded in tech-stack / `apps/mcp` README; this change implements it and updates the `mcp-tools` capability delta without a new ADR file.

## Notes

Ticket explicitly: do not re-open facade ADRs 0001–0006.
