# mcp

Remote MCP server for agent integration. Thin HTTP process in front of `apps/api` (and related backends).

## Stack

| Piece | Choice |
|---|---|
| SDK | **`@modelcontextprotocol/sdk` 1.32.1** |
| Transport | **HTTP** (remote / Coolify); Streamable HTTP at `POST /mcp` |
| Domain access | HTTP → `apps/api` with a Better Auth **service API key** — **no** Nest-in-MCP, **no** `packages/api-client` |
| Tools | `person_*` CRUD, `greeting_create` / `greeting_list` / `greeting_get`, `search`, `graph_related`, `graph_subgraph` |
| Retrieve / search | MCP tools call api `GET /graph/*` and `GET /search` only — **never** AGE or Typesense directly |
| Logging | **Service** — Pino (long-running Node HTTP server) |
| Build | `tsc` → `dist/` |

Global inventory: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#mcp-appsmcp). Facade contract: [`apps/api/README.md` § Retrieve / search](../api/README.md#retrieve--search-facade).

## Configuration (root `.env`)

| Key | Required | Notes |
|---|---|---|
| `MCP_HOST` | no (default `0.0.0.0`) | Bind address |
| `MCP_PORT` | no (default `3100`) | Listen port |
| `API_URL` | **yes** | Base URL of `apps/api` (e.g. `http://localhost:3000`) |
| `MCP_SERVICE_API_KEY` | **yes** | Better Auth managed key; sent as **`x-api-key`** |
| `LOG_LEVEL` | no (default `info`) | Shared |
| `NODE_ENV` | no | Shared |

Do **not** add `apps/mcp/.env`. Never set Typesense/AGE credentials on MCP.

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/mcp/Dockerfile` (monorepo-root build context if shared packages are needed); Coolify builds from Git — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md#coolify-build-deploy-data-services). Dockerfile not scaffolded in this change.

## Local

**Prerequisites:** a reachable `api` (and any backends tools call). Root [Local development](../../README.md#local-development).

```bash
pnpm run --filter mcp dev
```

### Tools (HTTP → api only)

| Tool | Api route |
|---|---|
| `person_create` / `person_list` / `person_get` / `person_update` / `person_delete` | `/person` |
| `greeting_create` / `greeting_list` / `greeting_get` | `/greeting` |
| `search` | `GET /search` |
| `graph_related` | `GET /graph/related` |
| `graph_subgraph` | `GET /graph/subgraph` |

Smoke (mocked API, no live server required):

```bash
pnpm --filter mcp typecheck && pnpm --filter mcp build && pnpm --filter mcp smoke
```
