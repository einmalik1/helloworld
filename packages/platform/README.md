# platform

In-process **application / use-case facade** shared by server-side apps.

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesplatform).  
Build: `tsc` → `dist/` — [`Build / emit contract`](../../openspec/tech-stack.md#build--emit-contract).

## Consumers

| May depend on `@helloworld/platform` | Must not (use `@helloworld/api-client` instead) |
| ------------------------------------ | ----------------------------------------------- |
| `apps/api`                           | `apps/web`                                      |
| `apps/mcp`                           | `tools/cli`, `tools/tui`                        |

API and MCP call platform **in-process** (same use-cases). They do not duplicate Postgres / S3 / search / graph SDK wiring in controllers or MCP tools.

## Boundary

| In scope                                      | Out of scope                                      |
| --------------------------------------------- | ------------------------------------------------- |
| Domain use-cases                              | Orval / ky / OpenAPI HTTP SDK (`api-client`)      |
| Repository ports + adapters to engines        | Nest HTTP controllers and routes                  |
| Shared application services                   | CLI/TUI/web UI (`terminal`, bundlers)             |

No dependency on `@helloworld/api-client` or `@nestjs/*` in this package — Nest adapts `DatabaseService` to repository ports from `apps/api`.

Postgres, S3/Garage, search, and graph adapters belong **behind** this facade (ports today; more adapters later) — not in CLI/web and not duplicated in both API and MCP.

## Layout

```text
src/
├── index.ts           # public facade exports
├── channel/           # Channel CRUD use-cases + ChannelRepository port
└── (later) adapters/  # shared engine helpers if needed
```

### Channel

Exports: `createChannel`, `getChannel`, `listChannels`, `updateChannel`, `deleteChannel`, `UniqueSlugError`, and the `ChannelRepository` port.

Callers supply a `ChannelRepository` implementation (Nest wires Drizzle via `DatabaseService`). Use-cases return `neverthrow` `Result` with typed `@helloworld/types` errors.

## Scripts

```bash
pnpm run --filter @helloworld/platform build
pnpm run --filter @helloworld/platform typecheck
pnpm run --filter @helloworld/platform smoke
```
