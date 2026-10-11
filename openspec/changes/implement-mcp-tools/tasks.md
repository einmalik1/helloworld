## 1. Package scaffold

- [x] 1.1 Add `apps/mcp/package.json` (name `mcp`), tsconfig, vitest config; deps at tech-stack pins (`@modelcontextprotocol/sdk` 1.32.1, `pino` 10.3.1, `zod`, `tsx`/`typescript`/`vitest`/`pino-pretty` as needed)
- [x] 1.2 Implement Zod `envSchema` + root `.env` load (`MCP_HOST`/`MCP_PORT`/`API_URL`/`MCP_SERVICE_API_KEY`/`NODE_ENV`/`LOG_LEVEL`); document keys in `.env.example` and `apps/mcp/README.md`

## 2. Thin API client + MCP server

- [x] 2.1 Implement thin `fetch` API helper with `x-api-key` (no `@helloworld/api-client` / `@helloworld/platform`)
- [x] 2.2 Boot Streamable HTTP MCP server via SDK (`createMcpExpressApp` + `McpServer` + `StreamableHTTPServerTransport`), Pino logging, listen on configured host/port
- [x] 2.3 Register person CRUD tools and greeting create/list/get tools mapping to `/person` and `/greeting` API routes

## 3. Verification

- [x] 3.1 Add Vitest smoke: API helper URL/headers with mocked `fetch`; expected tool names registered
- [x] 3.2 Run `pnpm --filter mcp typecheck && build && smoke` until green
