# postgres

Relational database persistence for `api` and `worker`, including the **Apache AGE** graph extension on the same instance.

**Prod / QA:** Coolify PostgreSQL with a **custom AGE-enabled image** pinned via `--image` (same image family as local Compose). Stock Coolify one-click Postgres **cannot** `CREATE EXTENSION age`. See [`openspec/tech-stack.md`](../../openspec/tech-stack.md#search--knowledge-graph) and ADR [`0004`](../../openspec/decisions/0006-search-knowledge-graph.md).

## AGE-enabled image

| Concern | Contract |
|---|---|
| Image | Custom Postgres **18** image with Apache AGE baked in (build/publish path under this folder when wired) |
| Local | Compose service `postgres` uses that image — aligned with root `.env` `DATABASE_URL` |
| Coolify | Pin the **same** image (custom / `--image`); do not rely on unmodified one-click PG for graph features |
| Bootstrap | `CREATE EXTENSION IF NOT EXISTS age;` (and AGE catalog setup) on first migrate / init — not runtime DDL in Nest |
| Clients | `apps/api` / `apps/worker` only; no public AGE port to CLI/TUI/MCP/web |

AGE is a **secondary projection** next to relational tables. Domain DDL stays in `openspec/data-model/schema.sql`; Drizzle in `packages/modules`. Cypher stays inside api/worker — product clients use structured retrieve routes on `apps/api`.

## Local

Part of the monorepo happy path (root [Local development](../../README.md#local-development)).

```bash
pnpm run docker:local:up          # intent — all local data services
# or:
docker compose up -d postgres
```

**Compose (intent):** service `postgres` in a root `docker-compose.yml` (or `infra/postgres` compose included from root). Image/credentials aligned with root `.env` `DATABASE_URL` — no separate env file under `infra/`.

Schema and ORM do not live here — DDL in `openspec/data-model/schema.sql`; Drizzle in `packages/modules` / `apps/api`.
