# platform

In-process **application / use-case facade** shared by server-side apps.

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesplatform).  
Build: `tsc` → `dist/` — [`Build / emit contract`](../../openspec/tech-stack.md#build--emit-contract).

## Consumers

| May depend on `@helloworld/platform` | Must not (use `@helloworld/api-client` instead) |
| ------------------------------------ | ----------------------------------------------- |
| `apps/api`                           | `apps/web`                                      |
| `apps/mcp`                           | `tools/cli`, `tools/tui`                        |
| `apps/worker`                        |                                                 |

API and MCP call platform **in-process** (same use-cases). They do not duplicate Postgres / S3 / search / graph SDK wiring in controllers or MCP tools.

## Boundary

| In scope                                       | Out of scope                                 |
| ---------------------------------------------- | -------------------------------------------- |
| Domain use-cases                               | Orval / ky / OpenAPI HTTP SDK (`api-client`) |
| Adapters to Postgres, Garage/S3, search, graph | Nest HTTP controllers and routes             |
| Shared application services                    | CLI/TUI/web UI (`terminal`, bundlers)        |

No dependency on `@helloworld/api-client` or `@nestjs/*` in this package — Nest may wrap platform later from `apps/api` / `packages/modules`.

## Layout

```text
src/
├── index.ts           # public facade exports
├── adapters/
│   └── s3/            # S3-compatible object storage (Garage / MinIO)
└── search-graph/      # AGE projection + Typesense + relational graph retrieve + outbox
```

## Object storage

`createS3ObjectStorage(config)` returns an `ObjectStorage` port (`putObject` / `getObject` / `deleteObject` / `headObject`) backed by `@aws-sdk/client-s3`. Nest apps obtain it via `@helloworld/modules` `ObjectStorageModule` — do not construct the SDK in controllers or in web/CLI clients.

### Search / knowledge graph

| Port               | Adapter                                               | Used by                    |
| ------------------ | ----------------------------------------------------- | -------------------------- |
| `GraphStore`       | `RelationalGraphStore` (SoT SQL → `{ nodes, edges }`) | `apps/api` retrieve        |
| `SearchIndex`      | `TypesenseSearchIndex`                                | `apps/api` search + worker |
| `ProjectionSync`   | `SearchGraphProjectionSync` (AGE Cypher + Typesense)  | `apps/worker`              |
| `SearchSyncOutbox` | `PostgresSearchSyncOutbox`                            | api enqueue / worker drain |

MCP and browsers MUST call `apps/api` HTTP routes — never Typesense/AGE URLs.

## Scripts

```bash
pnpm run --filter @helloworld/platform build
pnpm run --filter @helloworld/platform typecheck
```
