# api-client

Typed REST client SDK for `apps/api` and `apps/worker`. Transport: **ky**.

Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagesapi-client).  
Depends on `@helloworld/types` when wired.

**Not** for MCP — share domain types only; MCP stays its own protocol.

## Layout

```text
src/
├── client.ts      # factory: base URLs, auth hook, ky instance(s)
├── api/           # typed methods for apps/api
├── worker/        # typed methods for apps/worker
└── index.ts
```

**Consumers:** `tools/cli`, `tools/tui`, optionally `apps/web`.  
Terminal tools resolve URLs/keys via `@helloworld/terminal/config`, then call this SDK. Web does not use `packages/terminal`.
