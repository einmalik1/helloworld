## Context

`apps/mcp` is README-only. Tech-stack and the app README already require: remote HTTP MCP, Pino, domain access via HTTP → `apps/api` with a Better Auth service API key, **no** Nest-in-MCP, **no** `packages/api-client`. Baseline `mcp-tools` still describes in-process `@helloworld/platform`; this change updates that capability to match the documented thin-HTTP path without re-opening ADRs 0001–0006.

Wave B (`#41`–`#45`) owns API auth + CRUD. MCP tools target the published API routes (`/person`, `/greeting`); package smoke mocks `fetch` so the gate does not require a live API or Coolify.

In-force ADRs reviewed: 0001–0008 (see `adr.md`). ADR **0004** still says API+MCP call platform in-process; product SoT for MCP transport is now tech-stack / app README / this delta — ticket forbids reopening 0004 in this change.

## Goals / Non-Goals

**Goals:**

- Scaffold `apps/mcp` package: `package.json`, tsconfig, `main` HTTP MCP server, Zod env from root `.env`.
- Thin API helper (`fetch` + `x-api-key`) using `API_URL` + `MCP_SERVICE_API_KEY`.
- Register person CRUD + greeting create/list/get tools.
- Vitest smoke for client headers/paths and tool registration.
- Document env keys in `.env.example` and README.

**Non-Goals:**

- Dockerfile / Coolify Application create.
- Channel / greeting_reaction / search/graph tools (later tickets).
- Using `@helloworld/api-client` or `@helloworld/platform` inside MCP.
- Creating or superseding ADR 0004 in this PR.
- Full `tests/mcp` Coolify suite.

## Decisions

1. **Package** name `mcp` (`pnpm --filter mcp`), ESM, `tsc` → `dist/`, scripts: `dev` (`tsx watch`), `build`, `start`, `typecheck`, `smoke`.

2. **SDK**: `@modelcontextprotocol/sdk` **1.32.1** — `McpServer` + `StreamableHTTPServerTransport` + `createMcpExpressApp({ host })` (stateless per-request pattern from SDK examples). Mount `POST /mcp` (and method guards for GET/DELETE as in SDK sample).

3. **Env** (root `.env` `# --- mcp ---` + shared API URL):
   - `MCP_HOST` / `MCP_PORT` (existing)
   - `API_URL` (base URL of `apps/api`, e.g. `http://localhost:3000`)
   - `MCP_SERVICE_API_KEY` (Better Auth managed key; sent as `x-api-key`)
   - `LOG_LEVEL` / `NODE_ENV` (shared)
   - Validate with Zod at boot; no `apps/mcp/.env`.

4. **API client**: small hand-written module — `apiRequest(method, path, { query, body })` using global `fetch`, sets `x-api-key` and `content-type` when body present. Map non-2xx to tool error text including status + body snippet. **No** dependency on `@helloworld/api-client` or `@helloworld/platform`.

5. **Tools** (snake_case names aligned to resources/actions):
   - `person_create`, `person_list`, `person_get`, `person_update`, `person_delete`
   - `greeting_create`, `greeting_list`, `greeting_get`
   - Args match API JSON fields (`display_name`, `email`, `author_id`, `channel_id`, `message`, pagination `page`/`limit`).

6. **Logging**: `pino` **10.3.1** (+ `pino-pretty` in non-production).

7. **Smoke**: Vitest unit tests — (a) API helper builds URL/headers correctly with mocked `fetch`; (b) `createMcpServer` registers expected tool names. No live API required.

8. **Dockerfile**: skip (same as API scaffold ticket).

## Risks / Trade-offs

- **[Risk] Wave B routes not on `main` yet** → Mitigation: tools call documented paths; smoke mocks HTTP; runtime fails clearly if API missing.
- **[Risk] ADR 0004 wording vs tech-stack** → Mitigation: delta spec + README/tech-stack already HTTP; do not rewrite 0004 in this ticket.
- **[Trade-off] Stateless MCP sessions** → Simpler Coolify deploy; no resumability until needed.

## Migration Plan

1. Land scaffold + tools + smoke on automation branch; merge.
2. Operators set `API_URL` + `MCP_SERVICE_API_KEY` in Coolify/root env.
3. Rollback: remove `apps/mcp` sources / revert env example keys.

## Open Questions

- None blocking. A future ADR may formally supersede 0004’s MCP-in-process clause; out of scope for `#49`.
