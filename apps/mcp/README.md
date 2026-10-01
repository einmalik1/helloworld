# mcp

MCP server as a long-running service for agent integration with `api`, `worker`, and other components.

## Local

**Prerequisites:** backends this server proxies. Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- mcp ---`); do not add `apps/mcp/.env`.

```bash
pnpm run --filter mcp dev
```

Stack details come later.
