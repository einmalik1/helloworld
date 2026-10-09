# mcp

Remote MCP server for agent integration. Thin HTTP process in front of `apps/api` (and related backends).

## Stack

| Piece | Choice |
|---|---|
| SDK | **`@modelcontextprotocol/sdk` 1.32.1** |
| Transport | **HTTP** (remote / Coolify); not stdio as the v1 deploy path |
| Domain access | HTTP → `apps/api` with a Better Auth **service API key** — **no** Nest-in-MCP, **no** `packages/api-client` |
| Retrieve / search | MCP tools call api `GET /graph/*` and `GET /search` only — **never** AGE or Typesense directly |
| Logging | **Service** — Pino (long-running Node HTTP server) |
| Build | `tsc` → `dist/` when scaffolded |

Global inventory: [`spec/tech-stack.md`](../../spec/tech-stack.md#mcp-appsmcp). Facade contract: [`apps/api/README.md` § Retrieve / search](../api/README.md#retrieve--search-facade). ADR: [`0004`](../../spec/decisions/0004-search-knowledge-graph.md).

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/mcp/Dockerfile` (monorepo-root build context if shared packages are needed); Coolify builds from Git — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites:** a reachable `api` (and any backends tools call). Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- mcp ---`, e.g. `MCP_HOST` / `MCP_PORT`); do not add `apps/mcp/.env`.

```bash
pnpm run --filter mcp dev
```

Scaffolding (SDK HTTP server + tool wiring) comes when the package is implemented.
