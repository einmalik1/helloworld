# packages

Shared libraries for apps and tools. Packages exist; runtime wiring varies by package — see [`spec/tech-stack.md`](../spec/tech-stack.md#shared-packages-packages).

**Build:** runtime packages emit to `dist/` (`tsc`); `exports` must point at `dist/`, not `src/`. Tooling-only: `packages/config`. Contract: [`spec/tech-stack.md` — Build / emit](../spec/tech-stack.md#build--emit-contract).

| Package | Path | Role |
|---|---|---|
| `@helloworld/types` | `types/` | Entity Zod (`src/schema/`) + API Zod (`src/api/`) via `pnpm generate`; errors hand-authored |
| `@helloworld/modules` | `modules/` | NestJS infrastructure (config, DB, health, auth, OpenAPI) |
| `@helloworld/terminal` | `terminal/` | Terminal toolkit — config, stdio log, TTY (CLI/TUI/…); not web |
| `@helloworld/api-client` | `api-client/` | Orval SDK from OpenAPI + ky mutator — not MCP |
| `@helloworld/config` | `config/` | Shared tooling only (tsconfig, vitest, oxlint) |

```text
packages/config
       ↑
packages/types
       ↑
       ├── packages/modules     → Nest apps (apps/api, …)
       ├── packages/terminal    → tools/cli, tools/tui, (future terminal tools)
       └── packages/api-client  → tools/cli, tools/tui, (optional apps/web HTTP)
```

`packages/config` = **dev tooling**. `packages/terminal` = **runtime helpers for terminal tools** (user config + stdio + TTY). Do not mix.  
MCP consumers share `types` only; they do not use `api-client` as the MCP transport. Web does not use `packages/terminal`.
