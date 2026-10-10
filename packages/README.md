# packages

Shared libraries for apps and tools. Directories scaffolded; implementation TBD — see [`openspec/tech-stack.md`](../openspec/tech-stack.md#shared-packages-packages).

**Build:** runtime packages emit to `dist/` (`tsc`); `exports` must point at `dist/`, not `src/`. Tooling-only: `packages/config`. Contract: [`openspec/tech-stack.md` — Build / emit](../openspec/tech-stack.md#build--emit-contract).

| Package                  | Path          | Role                                                                                        |
| ------------------------ | ------------- | ------------------------------------------------------------------------------------------- |
| `@helloworld/types`      | `types/`      | Entity Zod (`src/schema/`) + API Zod (`src/api/`) via `pnpm generate`; errors hand-authored |
| `@helloworld/platform`   | `platform/`   | In-process use-case facade + engine adapters — for `apps/api` and `apps/mcp`               |
| `@helloworld/modules`    | `modules/`    | NestJS infrastructure (config, DB, health, auth, OpenAPI)                                   |
| `@helloworld/terminal`   | `terminal/`   | Terminal toolkit — config, stdio log, TTY (CLI/TUI/…); not web                              |
| `@helloworld/api-client` | `api-client/` | Orval SDK from OpenAPI + ky mutator — web / CLI / TUI                                       |
| `@helloworld/config`     | `config/`     | Shared tooling only (tsconfig, vitest, oxlint)                                              |

```text
packages/config
       ↑
packages/types
       ↑
       ├── packages/platform    → apps/api, apps/mcp (in-process; adapters behind facade)
       ├── packages/modules     → Nest apps (apps/api, …); may wrap platform later
       ├── packages/terminal    → tools/cli, tools/tui, (future terminal tools)
       └── packages/api-client  → tools/cli, tools/tui, (optional apps/web HTTP)
```

`packages/config` = **dev tooling**. `packages/terminal` = **runtime helpers for terminal tools** (user config + stdio + TTY). Do not mix.  
`packages/platform` = **application facade** for API/MCP. External clients use `api-client` only — not platform. Web does not use `packages/terminal`.
