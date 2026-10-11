# postgres

Relational database persistence for `api` and `worker`, including the **Apache AGE** graph extension on the same instance.

**Prod / QA:** Coolify PostgreSQL with a **custom AGE-enabled image** pinned via `--image` (same image family as local Compose). Stock Coolify one-click Postgres **cannot** `CREATE EXTENSION age`. See [`openspec/tech-stack.md`](../../openspec/tech-stack.md#search--knowledge-graph) and ADR [`0004`](../../openspec/decisions/0006-search-knowledge-graph.md).

## AGE-enabled image

| Concern           | Contract                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dockerfile        | [`Dockerfile`](./Dockerfile) — `FROM apache/age:release_PG18_1.8.0` (Postgres **18.6** + AGE **1.8.0**)                                                |
| Local Compose tag | `helloworld-postgres-age:pg18` via `infra/docker-compose.yml` build                                                                                    |
| Coolify           | Pin the **same** image family (`--image` after build/push, or rebuild from this Dockerfile); do not rely on unmodified one-click PG for graph features |
| Bootstrap         | Upstream entrypoint creates the AGE extension; graph `helloworld` is created by worker rebuild — not Nest runtime DDL                                  |
| Clients           | `apps/api` / `apps/worker` only; no public AGE port to CLI/TUI/MCP/web                                                                                 |

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
