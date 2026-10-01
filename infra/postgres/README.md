# postgres

Relational database persistence for `api` (and optionally `worker`).

**Prod / QA:** PostgreSQL via Coolify one-click (`coolify database create postgresql`), latest stable image — see [`spec/tech-stack.md`](../../spec/tech-stack.md).

## Local

Started as part of the monorepo happy path (root [Local development](../../README.md#local-development)):

```bash
docker compose up -d postgres
```

Compose service definition will live here (or a root compose that includes this service). Schema and ORM do not live here — they belong in related packages or `api`.
