# Architecture

System picture and component boundaries for Hello World — technology-agnostic where possible.

Keep it factual. Chosen technologies live in [`tech-stack.md`](tech-stack.md). Rationale for contested choices lives in [`decisions/`](decisions/).

## Components

See root `README.md` for the layout inventory (`apps/`, `tools/`, `infra/`, `tests/`, `spark/`, `packages/`).

| Layer | Components | Role |
|---|---|---|
| **Clients** | `apps/web`, `tools/cli`, `tools/tui` | Talk to product HTTP via `@helloworld/api-client` only |
| **Facades** | `apps/api`, `apps/mcp` | HTTP and MCP surfaces; thin; call `@helloworld/platform` |
| **Application** | `packages/platform` | Use-cases + adapters (DB, S3, search/graph) |
| **Nest infra** | `packages/modules` | Config, Drizzle/DB module, health, Better Auth, OpenAPI |
| **Jobs** | `apps/worker` | pg-boss consumers (impex and other jobs) |
| **Data** | Postgres, object storage (Garage/MinIO) | SoT + files |
| **Secondary index** | Search / knowledge graph | Rebuildable from Postgres; not SoT ([ADR 0006](decisions/0006-search-knowledge-graph.md)) |
| **Docs / gallery** | `apps/docs`, `apps/storybook` | Publish specs / UI gallery |

```text
  web / cli / tui
        |  api-client (HTTP)
        v
     apps/api  --------+--------  apps/mcp
        |              |  platform in-process
        v              v
           packages/platform
                |
     +----------+----------+----------+
     |          |          |          |
  Postgres    S3/Garage  search/   (future)
                         graph
        ^
        |
   apps/worker (pg-boss jobs, impex)
```

## Configuration boundary

Runtime configuration for all services and tools is a **single repo-root env file** (sectioned by component). Components validate only the keys they need; they do not each own a private env file. Details: root `README.md` (Environment) and [`tech-stack.md`](tech-stack.md#root-environment).

## Data model

Authoritative DDL: [`erd/schema.sql`](erd/schema.sql).  
Migrations: [ADR 0001](decisions/0001-schema-migrations.md).  
Regenerate: `pnpm generate` — Python generators under `spark/generators/`, config in `spark/repo-profile.yaml` → [`erd/generated/`](erd/generated/).

## Auth

Better Auth sessions (web) + managed API keys (tools/MCP) — [ADR 0003](decisions/0003-better-auth.md).

## Deploy / test plane

Coolify environments **test** / **qa** / **production** in `spark/repo-profile.yaml`. Agents/CI use **test**, not host Compose on the Coolify server.

## Related

| Doc | Role |
|---|---|
| [`tech-stack.md`](tech-stack.md) | Tech stack inventory |
| [`features/`](features/) | Behaviour / acceptance |
| [`decisions/`](decisions/) | ADRs |
| Root `CONTEXT.md` | Ubiquitous language |
| OpenSpec `openspec/specs/` | Capability requirements (after baseline archive) |
