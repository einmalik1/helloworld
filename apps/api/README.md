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

### Nest-facing env table (normative)

Names align with root [`.env.example`](../../.env.example) sections. Add keys there first, then to `envSchema`. **No** static `API_KEY` — auth secrets are Better Auth only.

| Key | Section | Required | Default | Description |
|---|---|---|---|---|
| `NODE_ENV` | Shared | no | `development` | Runtime mode (`development` / `production` / …) |
| `LOG_LEVEL` | Shared | no | **`info`** | Pino level: `debug` \| `info` \| `warn` \| `error` |
| `DATABASE_URL` | Postgres | **yes** | — | PostgreSQL connection string (postgres.js / Drizzle / health DB ping) |
| `API_HOST` | api | no | `0.0.0.0` | HTTP listen host |
| `API_PORT` | api | no | `3000` | HTTP listen port |
| `BETTER_AUTH_SECRET` | api | **yes** | — | Better Auth signing secret (local template value in `.env.example` only) |
| `BETTER_AUTH_URL` | api | **yes** | — | Better Auth base URL (e.g. `http://localhost:3000`) |
| `WEB_ORIGIN` | api | **yes** | — | Trusted web origin for CORS / Better Auth `trustedOrigins` |
| `S3_ENDPOINT` | Object storage | when using S3 | — | S3-compatible endpoint |
| `S3_REGION` | Object storage | when using S3 | `us-east-1` | Region |
| `S3_ACCESS_KEY_ID` | Object storage | when using S3 | — | Access key |
| `S3_SECRET_ACCESS_KEY` | Object storage | when using S3 | — | Secret key |
| `S3_BUCKET` | Object storage | when using S3 | — | Bucket name |
| `S3_FORCE_PATH_STYLE` | Object storage | when using S3 | `true` (local) | Path-style addressing for MinIO-compatible local S3 |

Worker, web, mcp, … keep their keys in **other sections of the same file** — not in this Nest schema.

### `envSchema` (sketch)

```typescript
// apps/api/src/configuration.ts
import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().min(1),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),
  // S3_* — include when this process touches object storage
});

export type AppConfig = z.infer<typeof envSchema>;
```

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

**Normative** scaffolding patterns for Nest **12** in this template (must match when generating or hand-wiring). Shared infra contracts: [`packages/modules`](../../packages/modules/README.md). Product contracts (error map, auth): [HTTP contract](#http-contract) and Better Auth wiring (process **#5**).

Stack anchors: Nest 12 · `nestjs-pino` · `nestjs-zod` · Better Auth (not static `ApiKeyModule`) · neverthrow · Vitest.

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

Rule: multiple related files → subfolder; a single service file may sit at the feature root. Optional external sync tree: `src/{feature}/sync/` + `{provider}/`.

### Bootstrap (`main.ts`) — normative

```typescript
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger)); // nestjs-pino Logger
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  setupOpenApi(app, { title: "Hello World API", description: "REST API" });
  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get("API_PORT", { infer: true });
  await app.listen(port);
}
```

- Global **`ZodValidationPipe`** only (nestjs-zod) — **do not** add per-route `@UsePipes(new ZodValidationPipe(Dto))` when the global pipe is registered  
- Global HTTP **exception filter** (map domain / Nest errors → [Problem Details](#error-envelope-rfc-9457-problem-details); log via Pino)  
- `setupOpenApi` runs from `main.ts` (not as a Nest provider), including **nestjs-zod** `cleanupOpenApiDoc`; optional `openapi:export` for Orval

### LoggerModule defaults — normative

Package name: **`nestjs-pino`** (not `pino-nestjs`). Defaults match [`spec/tech-stack.md` — Logging](../../spec/tech-stack.md#logging):

```typescript
LoggerModule.forRoot({
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? "info",
    autoLogging: false,
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { singleLine: true } }
        : undefined,
  },
});
```

| Setting | Template default |
|---|---|
| HTTP access logs | **`autoLogging: false`** (prefer off over flooding; filter `/health` only if access logs are turned on later) |
| Local format | `pino-pretty` with **`singleLine: true`** when `NODE_ENV !== "production"` |
| Prod / QA | JSON lines on stdout (no pretty transport) |

Optional shared bootstrap helper: [`packages/modules`](../../packages/modules/README.md#logging-optional).

### AppModule import order — normative

```typescript
@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    // AuthModule — Better Auth session + API-key guard (not static ApiKeyModule)
    DatabaseModule,
    HealthModule,
    LoggerModule.forRoot({ /* pino defaults above */ }),
    // Feature modules…
  ],
})
export class AppModule {}
```

Order: config → auth → database → health → logger → features.

### Controller / service Result mapping — normative

```typescript
// Service — return Result; do not throw for domain/DB failures
async findAll(): Promise<Result<Entity[], DatabaseError>> {
  try {
    /* ... */
    return ok(entities);
  } catch (e) {
    return err(new DatabaseError(e));
  }
}

// Controller — only layer that turns Results into HTTP for happy-path control flow
const result = await this.service.findAll();
if (result.isErr()) {
  throw new HttpException(
    /* Problem Details body from filter / helper */,
    /* status from status map */,
  );
}
return result.value;
```

Controller checklist:

1. Thin — delegate to the service  
2. Inspect `Result` → on `isErr()`, `throw new HttpException(...)`  
3. `@ApiResponse` / response DTO types for OpenAPI  
4. `@HttpCode` when not the Nest default  
5. Body/query via Zod DTO classes validated by the **global** `ZodValidationPipe` only

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

### Exception filter — normative

Global filter under `src/common/filters/` (`@Catch()` / Nest HTTP exceptions as needed):

- Map known errors from `@helloworld/types` (e.g. `NotFound`, `ValidationError`, `DatabaseError`) via the [status map](#status-map-error-classes-only) — never string sniffing  
- Emit [RFC 9457 Problem Details](#error-envelope-rfc-9457-problem-details) (`application/problem+json`); Zod field issues go in optional `errors`  
- Shape intent: `response.status(status).json(body)` with that envelope  
- Unknown errors → 500; log with context; never leak secrets  
- Works together with controller `HttpException` throws for `Result` mapping

### Auth on routes

- Global guard: session cookie and/or Better Auth API key (`verifyApiKey`) — **not** a static env `ApiKeyModule` / `ApiKeyGuard`  
- **`@Public()`** — skip the global guard (health, selected auth routes)  
- Details: [`packages/modules` auth](../../packages/modules/README.md#auth)

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
| Unit | Vitest + `@nestjs/testing` | Mock `DatabaseService` / externals; override Better Auth guard (below) |
| HTTP | **supertest** | Against testing-module Nest app or running server |
| Suite | `tests/api` | Against running `api` + Postgres — see [`tests/api/README.md`](../../tests/api/README.md) |

### Vitest module test — normative

Override the Better Auth guard (not a forever `ApiKeyGuard` name):

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [/* test config */],
  controllers: [ResourceController],
  providers: [{ provide: ResourceService, useValue: mockService }],
})
  .overrideGuard(/* AuthGuard — Better Auth session / API-key */)
  .useValue({ canActivate: () => true })
  .compile();
```
