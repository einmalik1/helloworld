# mcp

MCP server as a long-running service for agent integration with `api`, `worker`, and other components.

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/mcp/Dockerfile` (monorepo-root build context if shared packages are needed); Coolify builds from Git — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites:** backends this server proxies. Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- mcp ---`); do not add `apps/mcp/.env`.

```bash
pnpm run --filter mcp dev
```

Stack: `@modelcontextprotocol/sdk` over **HTTP**; domain via `apps/api` + service API key; Pino — [`spec/tech-stack.md`](../../spec/tech-stack.md#mcp-appsmcp).
