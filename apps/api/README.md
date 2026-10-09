# api

REST backend for persistence and domain API. Data via Postgres; files via S3. Auth via Better Auth (see [`spec/tech-stack.md`](../../spec/tech-stack.md)).

Stack inventory and Nest package versions: [`spec/tech-stack.md`](../../spec/tech-stack.md). Shared Nest infra: [`packages/modules`](../../packages/modules/README.md).

**Build:** `nest build` → `dist/`; Dev: `nest start --watch` (`@nestjs/cli`). Workspace libs build first (`tsc` → `dist/`). Contract: [`spec/tech-stack.md` — Build / emit](../../spec/tech-stack.md#build--emit-contract).

## Deploy

QA/Prod: Coolify Application. Image from multi-stage `apps/api/Dockerfile` (build context = monorepo root). Coolify builds from Git on deploy — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services). Runtime runs built JS (`node dist/main.js`). Dockerfile not scaffolded yet.

## Local

**Prerequisites:** local Postgres and (for file features) S3 — root [Local development](../../README.md#local-development).  
Config from the **root** `.env` only (sections `# --- Shared ---`, `# --- Postgres ---`, `# --- api ---`, …); do **not** add `apps/api/.env`.

```bash
pnpm run docker:local:up   # or: docker compose up -d postgres s3
pnpm run dev               # from repo root
# or only this package:
pnpm run --filter api dev
```

## Configuration (root `.env`)

All process env comes from the **single repo-root** `.env` (template: [`.env.example`](../../.env.example)). Nest does **not** own a second env file.

| Rule | Detail |
|---|---|
| Source | Root `.env` loaded when the process is started from the repo root |
| Validation | Zod `envSchema` in `apps/api` `configuration.ts` → `createAppConfigModule({ envSchema })` from `@helloworld/modules` |
| Scope | Schema lists only keys **this process** needs; values still live in the shared root file (sectioned by service) |
| Forbidden | `apps/api/.env`, dotenv path overrides that point away from the repo root |

### Keys this app reads (intent)

Names align with root `.env.example` sections. Add keys there first, then to `envSchema`.

| Key | Section in `.env.example` | Role |
|---|---|---|
| `NODE_ENV` | Shared | `development` / `production` / … |
| `LOG_LEVEL` | Shared | Pino level (`debug` \| `info` \| `warn` \| `error`, default `info`) |
| `DATABASE_URL` | Postgres | PostgreSQL connection string |
| `API_HOST` / `API_PORT` | api | HTTP listen bind |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | api | Better Auth server config |
| `WEB_ORIGIN` | api | CORS / trusted web origin |
| `S3_*` | Object storage | Only when this process touches object storage |

Worker, web, mcp, … keep their keys in **other sections of the same file** — not in this Nest schema.

## Generated Nest DTOs

`pnpm generate` / `pnpm generate:nest-dto` writes thin `createZodDto` wrappers:

```text
apps/api/src/{resource}/dto/
  create-{resource}.dto.ts
  update-{resource}.dto.ts
  {resource}-response.dto.ts
  index.ts
```

Schemas come from `@helloworld/types/api`. Do not hand-edit these files.

## HTTP contract

Frozen product contract for REST responses. Exception filter (#7) and Orval client mutator must match this section. Rationale: [`spec/decisions/0002-api-problem-details.md`](../../spec/decisions/0002-api-problem-details.md). Issue: [#5](https://github.com/einmalik1/helloworld/issues/5).

### Error envelope (RFC 9457 Problem Details)

One global filter; **no** per-route error shapes. Failed responses use `Content-Type: application/problem+json` with [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) fields:

| Field | Required | Role |
|---|---|---|
| `type` | yes | Stable, documented problem URI — clients branch on this, not free text |
| `title` | yes | Short, stable summary |
| `status` | yes | HTTP status (mirrors the response status; status line remains authoritative) |
| `detail` | yes | Occurrence-specific explanation — **not** for programmatic parsing |
| `errors` | no | Extension member for field errors (Zod issues → `pointer` / `detail`), analogous to the RFC example |

Do **not** use a legacy `{ error }` / `{ error, errors[] }` envelope.

### Status map (error classes only)

Map exclusively from `@helloworld/types` error classes (and Nest / nestjs-zod validation failures). **Reject** `message.includes("not found")` and any string sniffing.

| Klasse / Fall | HTTP | Notes |
|---|---|---|
| Zod / Validation | **400** | Nest-idiomatic; see ADR — frozen (not 422) |
| NotFound | **404** | Domain / resource missing |
| DatabaseError / unknown | **500** | Never leak internals or secrets |

### Lists

| Aspect | Contract |
|---|---|
| Query | `page` (1-based), `limit` — coerce to int; **max cap 100** |
| Response | `{ items, total, page, limit }` — Orval-friendly; TUI can page via terminal config `pageSize` |
| Sort / filter | Hand-written query DTOs per resource when needed; keep shared pagination fields stable |
| Cursor | Deferred — revisit only if collections become large/volatile |

Example query schema (hand-written `createZodDto`, not generated):

```typescript
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
```

### Resource CRUD

| Concern | Contract |
|---|---|
| Paths | `/resource`, `/resource/:id` |
| Create | `POST /resource` → **201** (+ optional `Location`) |
| Update | `PATCH /resource/:id` = partial (`Update = Create.partial()` via generator) |
| Delete | `DELETE /resource/:id` → **204** |
| IDs | **UUID** (`gen_random_uuid` in Postgres) unless a product feature requires shortIds |

### Fixed infrastructure routes

| Method | Path | Notes |
|---|---|---|
| `GET` | `/health` | `@Public()` |
| `GET` | `/api/docs` | Swagger UI |
| `GET` | `/openapi.json` | Runtime OpenAPI document **and** build-time `openapi:export` for Orval CI |

## NestJS conventions

Intent for scaffolding `main.ts`, `AppModule`, and feature modules. Align with [`packages/modules`](../../packages/modules/README.md).

### Layout

**Root (`src/`)** — cross-cutting only:

```text
src/
├── app.module.ts
├── main.ts
├── configuration.ts          # Zod envSchema + AppConfig (reads process.env from root .env)
└── common/                   # filters, decorators — not a Nest feature module
    └── filters/
        └── http-exception.filter.ts
```

**Feature (`src/{feature}/`)** — one bounded context:

```text
src/{feature}/
├── {feature}.module.ts
├── {feature}.controller.ts
├── {feature}.service.ts
└── dto/                      # generated createZodDto wrappers (see above)
```

Rule: multiple related files → subfolder; a single service file may sit at the feature root.

### AppModule (intent)

Import shared modules from `@helloworld/modules`, then feature modules:

1. `createAppConfigModule({ envSchema })` — root env → validated config  
2. Auth module (Better Auth session + API-key guard; global)  
3. `DatabaseModule` — Drizzle + `DatabaseService`  
4. `HealthModule` — `GET /health` (**`@Public()`**)  
5. `LoggerModule` (nestjs-pino)  
6. Feature modules (e.g. greeting, channel, person)

`setupOpenApi(app, …)` runs from `main.ts` (not as a Nest provider), including **nestjs-zod** `cleanupOpenApiDoc` on the document.

### Bootstrap (`main.ts`)

- Global **`ZodValidationPipe`** (nestjs-zod)  
- Global HTTP **exception filter** (map domain / Nest errors → status + body; log via Pino)  
- `setupOpenApi` + optional export path for Orval (`openapi:export`)

### Controller pattern

1. Thin — delegate to the service  
2. Inspect `Result` from the service → on `isErr()`, `throw new HttpException(...)` (controllers are the only layer that turns Results into HTTP exceptions for happy-path control flow)  
3. `@ApiResponse` / response DTO types for OpenAPI  
4. `@HttpCode` when not the Nest default  
5. Body/query validated via Zod DTO classes (`ZodValidationPipe` global or `@UsePipes`)

### Service pattern

1. `@Injectable()`, constructor injection  
2. Return `Promise<Result<T, E>>` (**neverthrow**) — no `throw` for domain/DB failures  
3. Log with `@InjectPinoLogger`  
4. Config via `ConfigService<AppConfig, true>` (`{ infer: true }`)  
5. Persistence via injected `DatabaseService`

### DTO pattern

- **Generated** Nest classes only: `export class CreateXDto extends createZodDto(createXSchema) {}`  
- Schemas live in `@helloworld/types/api` — do not redefine Zod in the app  
- Hand-written query DTOs (pagination, filters) may use `createZodDto` locally when not generated

### Exception filter

Global filter under `src/common/filters/`:

- Map known errors from `@helloworld/types` (e.g. `NotFound`, `ValidationError`, `DatabaseError`) via the [status map](#status-map-error-classes-only) — never string sniffing  
- Emit [RFC 9457 Problem Details](#error-envelope-rfc-9457-problem-details) (`application/problem+json`); Zod field issues go in optional `errors`  
- Unknown errors → 500; log with context; never leak secrets  
- Works together with controller `HttpException` throws for `Result` mapping

### Auth on routes

- Global guard: session cookie and/or Better Auth API key (`verifyApiKey`)  
- **`@Public()`** — skip the global guard (health, selected auth routes)  
- Details: [`packages/modules` auth](../../packages/modules/README.md)

### External API integration (optional)

When a feature syncs with an outside REST/OAuth API:

```text
src/{feature}/sync/
├── sync.module.ts
├── sync.service.ts           # orchestration / upsert
└── {provider}/
    ├── {provider}.module.ts
    └── {provider}.service.ts # auth, HTTP, Zod-map responses
```

Validate external payloads with Zod; persist via `DatabaseService`; surface failures as typed errors in `@helloworld/types`.

## Testing

| Layer | Tool | Notes |
|---|---|---|
| Unit | Vitest + `@nestjs/testing` | Mock `DatabaseService` / externals |
| HTTP | **supertest** | Against testing-module Nest app or running server |
| Suite | `tests/api` | Against running `api` + Postgres — see [`tests/api/README.md`](../../tests/api/README.md) |
