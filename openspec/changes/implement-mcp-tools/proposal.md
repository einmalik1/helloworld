## Why

Wave C needs a remote MCP server so agents can exercise domain behaviour. `apps/mcp` is still README-only while tech-stack and the app README already require a thin HTTP process in front of `apps/api` with a Better Auth service API key (no Nest-in-MCP, no `@helloworld/api-client`).

## What Changes

- Scaffold `apps/mcp` as an HTTP MCP server (`@modelcontextprotocol/sdk` 1.32.1, Streamable HTTP, Pino).
- Add a thin typed `fetch` client that calls `apps/api` with `x-api-key` from root env (`API_URL` + `MCP_SERVICE_API_KEY`) — **not** `packages/api-client` / Orval.
- Register MCP tools whose names/args mirror product API resources (person CRUD + greeting create/list/get as the first agent surface).
- Align `mcp-tools` requirements with the HTTP→API transport already documented in tech-stack / `apps/mcp` README (delta from the older in-process platform wording).
- Package smoke (tool registration + HTTP client header/path behaviour with mocked `fetch`) without requiring Coolify.
- Do **not** re-open facade ADRs 0001–0006; do not embed `@helloworld/platform` or Nest modules in MCP.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `mcp-tools`: Require thin HTTP transport to `apps/api` with Better Auth service API key; forbid `api-client` and in-process platform as MCP’s primary domain path; pin tool semantics to API resources.

## Impact

- Primary: `apps/mcp` (package scaffold, server, tools, smoke), root `.env.example` MCP section (`API_URL`, `MCP_SERVICE_API_KEY`).
- Consumes: running `apps/api` HTTP contract + Better Auth `x-api-key` (Wave B); MCP remains deployable/smokeable with mocked API.
- Docs: light README/ops checklist updates under `apps/mcp`.
- Unlocks: agent integrations against Coolify MCP Application once shipped.
