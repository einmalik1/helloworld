# postgres

Relational database persistence for `api` (and optionally `worker`).

**Prod / QA:** PostgreSQL via Coolify one-click (`coolify database create postgresql`), latest stable image — see [`spec/tech-stack.md`](../../spec/tech-stack.md).

## Local

Part of the monorepo happy path (root [Local development](../../README.md#local-development)).

```bash
pnpm run docker:local:up          # intent — all local data services
# or:
docker compose up -d postgres
```

**Compose (intent):** service `postgres` in a root `docker-compose.yml` (or `infra/postgres` compose included from root). Image/credentials aligned with root `.env` `DATABASE_URL` — no separate env file under `infra/`.

Schema and ORM do not live here — DDL in `spec/erd/schema.sql`; Drizzle in `packages/modules` / `apps/api`.