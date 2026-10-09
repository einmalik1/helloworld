# worker

Background jobs and scheduled automation. Nest standalone process alongside `apps/api`.

## Stack

| Piece | Choice |
|---|---|
| Runtime | NestJS **12** standalone (shares `packages/modules`: Config / Database / Health / Logging) |
| Jobs | **`@nestjs/schedule` 12.0.2** — cron / interval in-process; **no** separate broker (pg-boss etc.) in v1 |
| HTTP | Internal only — `GET /health` (+ optional admin later); **no** OpenAPI / Orval input in v1 |
| Logging | **Service** — Pino via `nestjs-pino` (same rules as `apps/api`) |
| Build | `nest build` → `dist/`; Coolify runs built JS |

Global inventory: [`spec/tech-stack.md`](../../spec/tech-stack.md#worker-appsworker).

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/worker/Dockerfile` (monorepo-root build context); Coolify builds from Git — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites:** Postgres always; S3 when jobs touch object storage. Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- worker ---`); do not add `apps/worker/.env`.

```bash
pnpm run --filter worker dev
```

Scaffolding (Nest app + schedule modules) comes when the package is implemented.
