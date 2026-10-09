# worker

Background jobs and scheduled automation. Nest standalone process alongside `apps/api`.

## Stack

| Piece | Choice |
|---|---|
| Runtime | NestJS **12** standalone (shares `packages/modules`: Config / Database / Health / Logging) |
| Jobs | **`@nestjs/schedule` 12.0.2** — cron / interval in-process; **no** separate broker (pg-boss etc.) in v1 |
| HTTP | Internal only — `GET /health` (+ optional admin later); **no** OpenAPI / Orval input in v1 |
| Projection sync | Outbox drain → **Apache AGE** + **Typesense** after api writes (not sync-on-write) |
| Logging | **Service** — Pino via `nestjs-pino` (same rules as `apps/api`) |
| Build | `nest build` → `dist/`; Coolify runs built JS |

Global inventory: [`spec/tech-stack.md`](../../spec/tech-stack.md#worker-appsworker). Graph/search sync: [`spec/tech-stack.md` § Search / knowledge graph](../../spec/tech-stack.md#search--knowledge-graph).

## Projection / sync jobs (intent)

Keep secondary indexes current after Postgres writes. Api remains SoT; this process owns AGE projection and Typesense upserts/deletes.

| Job | Trigger | Role |
|---|---|---|
| Outbox drain | `@nestjs/schedule` interval | Read transactional outbox rows written by api; apply AGE + Typesense mutations |
| Rebuild | Scheduled / manual admin later | Full re-project domain → AGE graph + Typesense collection `helloworld` |

| Concern | Contract |
|---|---|
| Write path | Api → Postgres (+ outbox row) first; worker catches up asynchronously |
| Engines | Same `DATABASE_URL` (AGE) + root `TYPESENSE_*` — network-internal |
| Domain mapping | person / channel / greeting / reaction nodes + edges — ADR [`0004`](../../spec/decisions/0004-search-knowledge-graph.md) |
| Forbidden | Sync-on-write inside api request handlers; exposing engine ports publicly |

## Nest conventions (worker)

Same Nest **12** / `nestjs-pino` / neverthrow line as the API. **Normative** HTTP/OpenAPI/DTO sketches live in [`apps/api/README.md` — NestJS conventions](../api/README.md#nestjs-conventions); this process adapts them as follows:

| Concern | Worker |
|---|---|
| Runtime | Nest **standalone** (no public REST surface in v1) |
| OpenAPI / Orval | **Out** — no `setupOpenApi` |
| Validation pipe | Not required for cron-only handlers; if HTTP admin routes appear later, use **global** `ZodValidationPipe` only (same rule as api) |
| Auth | Better Auth service key / internal guard when exposing admin HTTP — **not** static `ApiKeyModule` |
| Logging | Same `LoggerModule.forRoot` defaults as api (`autoLogging: false`; pino-pretty `singleLine` when not production) — see [api LoggerModule](../api/README.md#loggermodule-defaults--normative) |
| Jobs | Feature modules + `@nestjs/schedule` providers after shared infra imports |

**AppModule order (intent):** `createAppConfigModule` → auth (if needed) → `DatabaseModule` → `HealthModule` → `LoggerModule.forRoot` → `ScheduleModule.forRoot()` → job feature modules.

Shared module contracts: [`packages/modules`](../../packages/modules/README.md).

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/worker/Dockerfile` (monorepo-root build context); Coolify builds from Git — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites:** Postgres always; S3 when jobs touch object storage. Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- worker ---`); do not add `apps/worker/.env`.

```bash
pnpm run --filter worker dev
```

Scaffolding (Nest app + schedule modules) comes when the package is implemented.
