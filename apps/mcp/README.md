# mcp

MCP server as a long-running service for agent integration.

## Domain access

MCP tools call **`@helloworld/platform` in-process** — same use-cases as `apps/api`. Do **not** use `@helloworld/api-client` as the MCP domain transport.

Decision: [ADR 0004](../../openspec/decisions/0004-platform-facade-mcp.md). OpenSpec: `mcp-tools`.

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/mcp/Dockerfile` (monorepo-root build context if shared packages are needed); Coolify builds from Git — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites:** Postgres (and other backends platform needs). Prefer Coolify **test** when running on the Coolify host. Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- mcp ---`); do not add `apps/mcp/.env`.

```bash
pnpm run --filter mcp dev
```

Auth for protected tools: Better Auth managed API keys ([ADR 0003](../../openspec/decisions/0003-better-auth.md)).
