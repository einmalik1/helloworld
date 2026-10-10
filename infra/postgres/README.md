# postgres

Relational database persistence for `api` (and optionally `worker`).

**Prod / QA:** PostgreSQL via Coolify one-click (`coolify database create postgresql`), latest stable image — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md).

## Local (laptops)

Part of the monorepo happy path (root [Local development](../../README.md#local-development)).

```bash
pnpm run docker:local:up          # Postgres + S3 stand-in via infra/docker-compose.yml
# or only this service:
docker compose -f infra/docker-compose.yml up -d postgres
```

**Compose:** service `postgres` in [`infra/docker-compose.yml`](../docker-compose.yml). Image/credentials aligned with root `.env` `DATABASE_URL` — no separate env file under `infra/`.

**Agents / CI on the Coolify host:** do **not** run Compose here (port clashes with Coolify). Use the Coolify **test** environment from [`spark/repo-profile.yaml`](../../spark/repo-profile.yaml) (`coolify.environments` slug `test`) and point `DATABASE_URL` at that service.

Schema and ORM do not live here — DDL in `openspec/data-model/schema.sql`; Drizzle in `packages/modules` / `apps/api`.
