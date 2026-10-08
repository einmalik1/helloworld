# worker

Background jobs and automation (queues, scheduled work).

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/worker/Dockerfile` (monorepo-root build context); Coolify builds from Git — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites:** Postgres always; S3 when jobs touch object storage. Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- worker ---`); do not add `apps/worker/.env`.

```bash
pnpm run --filter worker dev
```

Stack: Nest 12 standalone + `@nestjs/schedule`; internal HTTP (`/health`); Pino — [`spec/tech-stack.md`](../../spec/tech-stack.md#worker-appsworker).
