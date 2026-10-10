## REMOVED Requirements

### Requirement: MCP uses platform in-process

**Reason:** Tech-stack and `apps/mcp` README standardize MCP as a thin HTTP process in front of `apps/api` (service API key). In-process `@helloworld/platform` in MCP is no longer the product path; ticket `#49` forbids re-opening facade ADRs while implementing that documented transport.

**Migration:** Use the ADDED requirement “MCP uses HTTP API with service key”. Platform remains the in-process facade for `apps/api` (and worker) only.

## MODIFIED Requirements

### Requirement: Tool semantics align with API facade
MCP tool names and arguments MUST expose the same domain semantics as the product API (resources and actions), so agents and HTTP clients share one behavioural model.

#### Scenario: Greeting create exists on both surfaces
- **WHEN** greetings can be created via the API
- **THEN** an MCP tool exists that creates a greeting by calling the API greeting create route with the same fields

### Requirement: Auth for MCP matches machine clients
MCP connections that hit protected domain operations MUST authenticate to `apps/api` with the same machine-oriented Better Auth API-key model (service credential via `x-api-key`), not anonymous DB access and not a static env `API_KEY` product credential.

#### Scenario: No direct DB from MCP
- **WHEN** MCP performs a domain write
- **THEN** it goes through `apps/api` HTTP (and thus normal persistence/auth rules), not raw SQL from the MCP process as a bypass

## ADDED Requirements

### Requirement: MCP uses HTTP API with service key
`apps/mcp` MUST invoke domain operations by calling `apps/api` over HTTP with a Better Auth **service API key** (`x-api-key`). MCP MUST NOT use `@helloworld/api-client` (Orval/ky) as its domain transport, MUST NOT embed Nest modules or `@helloworld/platform` in-process, and MUST NOT open the database directly.

#### Scenario: Tool does not Orval-call the API by default
- **WHEN** an MCP tool creates or lists a domain resource
- **THEN** the implementation uses a thin `fetch` (or equivalent) HTTP client against `apps/api` with `x-api-key`, not `@helloworld/api-client` and not `@helloworld/platform` in-process

### Requirement: MCP HTTP server scaffold
`apps/mcp` MUST expose a remote Streamable HTTP MCP server using `@modelcontextprotocol/sdk` at the tech-stack pin, listen on root-env `MCP_HOST` / `MCP_PORT`, and log with Pino. Config MUST come from the repo-root `.env` only (no `apps/mcp/.env`).

#### Scenario: Server boots with root env
- **WHEN** an operator runs `pnpm run --filter mcp dev` (or `start` after build) with valid root env
- **THEN** the process listens on `MCP_HOST`:`MCP_PORT` and serves the MCP HTTP endpoint

### Requirement: Person and greeting tools via API
`apps/mcp` MUST register tools for person CRUD (`create` / `list` / `get` / `update` / `delete`) and greeting `create` / `list` / `get`, each mapping to the corresponding `apps/api` HTTP routes under `/person` and `/greeting`.

#### Scenario: Person list tool calls API
- **WHEN** an agent invokes the person list tool
- **THEN** MCP issues `GET /person` against `API_URL` with header `x-api-key: <MCP_SERVICE_API_KEY>` and returns the API JSON payload (or a structured tool error on non-2xx)
