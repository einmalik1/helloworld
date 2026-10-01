# packages

Shared libraries for apps and tools. Directories scaffolded; implementation TBD — see [`spec/tech-stack.md`](../spec/tech-stack.md#shared-packages-packages).

| Package | Path | Role |
|---|---|---|
| `@helloworld/types` | `types/` | Domain Zod schemas, inferred types, shared error classes |
| `@helloworld/modules` | `modules/` | NestJS infrastructure (config, DB, health, auth, OpenAPI) |
| `@helloworld/api-client` | `api-client/` | Typed REST client SDK (`ky`) for api + worker — not MCP |
| `@helloworld/config` | `config/` | Shared tooling only (tsconfig, vitest, oxlint) |

```text
packages/config
       ↑
packages/types
       ↑
       ├── packages/modules      → Nest apps (apps/api, …)
       └── packages/api-client   → tools/cli, tools/tui, (optional apps/web)
```

MCP consumers share `types` only; they do not use `api-client` as the MCP transport.
