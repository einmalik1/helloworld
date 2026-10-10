# 0004 — Platform facade for API and MCP

## Status

Accepted (spec-baseline)

## Context

Stack engines (Postgres, S3, search/graph) will change; agents and UIs need a stable seam. Package `@helloworld/platform` exists. OpenSpec: `platform-client`, `mcp-tools`.

## Decision

- **`apps/api`** and **`apps/mcp`** call domain use-cases via **`@helloworld/platform` in-process**.
- **Web / CLI / TUI** use **`@helloworld/api-client`** (HTTP) only — never platform, never engine SDKs.
- MCP MUST NOT use `api-client` as its primary domain transport.
- Engine adapters (DB, S3, search, graph) live **behind** platform.

## Consequences

- Controllers and MCP tools stay thin.
- Engine swaps touch adapters + ADR, not every client.

## Rejected

- MCP → Orval/HTTP → API as the default template path.
- Direct Neo4j/Meili/S3 credentials in CLI/web.
