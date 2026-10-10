# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-10
- Reviewer: agent (propose)
- Change: align-main-merge-gaps

## In-Force ADR Context Reviewed

- openspec/decisions/0001-schema-migrations.md — SQL SoT / migrate path
- openspec/decisions/0002-api-http-contract.md — Problem Details
- openspec/decisions/0003-better-auth.md — sessions + API keys
- openspec/decisions/0004-platform-facade-mcp.md — platform facade
- openspec/decisions/0005-worker-pg-boss.md — superseded by this change
- openspec/decisions/0006-search-knowledge-graph.md — AGE + Typesense (capability alignment only; no new ADR)

## Repository-Level ADRs Created

- openspec/decisions/0007-worker-schedule-not-pg-boss.md — v1 worker uses `@nestjs/schedule` + Postgres work state; supersedes 0005

## Notes

Search/engine and Problem Details content already live in 0006 / 0002; this change syncs capability specs and design-system baseline to those ADRs rather than minting duplicates.
