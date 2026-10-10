# modules

Reusable NestJS infrastructure for `apps/api` (and other Nest apps).

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesmodules).  
App conventions: [`apps/api/README.md`](../../apps/api/README.md#nestjs-conventions).  
Depends on `@helloworld/types` when domain Zod is needed at the app layer.  
Build: `tsc` → `dist/` + subpath exports — [`Build / emit contract`](../../openspec/tech-stack.md#build--emit-contract).

## Layout

```text
src/
├── config/      # createAppConfigModule — Zod env at boot (process.env / root .env)
├── database/
│   ├── schema/          # domain Drizzle TS from generator (schema.sql → drizzle stage)
│   ├── auth-schema.ts   # Better Auth CLI SoT (not in schema.sql)
│   ├── schema-entry.ts  # combined entry for drizzle-kit + DatabaseService
│   ├── database.module.ts
│   └── database.service.ts
├── health/      # HealthModule (@nestjs/terminus); routes marked @Public()
├── auth/        # Better Auth + @better-auth/api-key; global guard + @Public()
├── openapi/     # setupOpenApi — Swagger UI + JSON + nestjs-zod cleanupOpenApiDoc
├── logging/     # createLoggerModule — nestjs-pino defaults
└── index.ts     # Nest modules + schema re-exports
```

Keep **domain** and **auth** Drizzle schemas as separate files. Subpath exports: `@helloworld/modules/database/schema`, `@helloworld/modules/database/auth-schema`. Not for CLI/TUI — those use `@helloworld/api-client`.

## Module contracts

### Config

- `createAppConfigModule({ envSchema })` loads root `.env` from `process.cwd()` and validates with the caller Zod schema
- Callers start from the **repo root** so the single root `.env` is what Nest sees — this package does **not** read `apps/*/.env`
- Each app passes its own Zod `envSchema` (subset of root keys)

### Database

- Drizzle ORM **0.45.3** + drizzle-kit **0.31.11** (root scripts); Nest `DatabaseService` uses postgres.js **3.4.9**
- **Domain schema:** `pnpm generate:drizzle` (or full `pnpm generate`) writes [`src/database/schema/`](src/database/schema/) from [`openspec/data-model/schema.sql`](../../openspec/data-model/schema.sql) — do not hand-edit those files  
- **Auth schema:** [`src/database/auth-schema.ts`](src/database/auth-schema.ts) — Better Auth owned; regenerate with `pnpm dlx auth@1.7.7 generate --config <auth-instance> --output packages/modules/src/database/auth-schema.ts`. **Do not** merge auth DDL into `schema.sql`  
- **Migrations:** root `drizzle.config.ts` → SQL under [`drizzle/`](drizzle/); apply with **`pnpm db:migrate`**. Coolify **pre-deploy** runs the same command — **no** runtime DDL in Nest lifecycle  
- Spec + ADR: [`tech-stack.md` § Database / Drizzle](../../openspec/tech-stack.md#database--drizzle-schema--migrations), [`decisions/0001-schema-migrations.md`](../../openspec/decisions/0001-schema-migrations.md)  

### Health (normative)

`GET /health` via `@nestjs/terminus` (**12.1.0**). Controller uses **`@Public()`**.

| Indicator | v1 | Notes |
|---|---|---|
| Process up | **yes** | Terminus liveness — process is serving |
| DB ping | **yes** | Postgres reachability via `DATABASE_URL` (`DatabaseService.ping`) |
| Memory / heap metrics | **no** | Skip fancy utilization indicators in v1 |

### Auth

Hand-written Better Auth wiring (no community Nest Better Auth package). ADR [`0003`](../../openspec/decisions/0003-better-auth.md).

| Concern | Contract |
|---|---|
| Packages | `better-auth` **1.7.7** + `@better-auth/api-key` **1.7.7** |
| Instance | `createAuth` / `AUTH_INSTANCE` from `AuthModule`; mount with `mountBetterAuth(app, auth)` |
| Adapter | Official **Drizzle** adapter; schema from `database/auth-schema.ts` |
| Global guard | Session cookie **or** API key via `auth.api.verifyApiKey` |
| API key header | **`x-api-key`** only |
| `@Public()` | Skip the global guard per handler/controller |
| Public by default | `GET /health`, Better Auth HTTP routes (`/api/auth`), OpenAPI (`/api/docs`, `/openapi.json`) |
| Origins | `trustedOrigins` from Nest config `WEB_ORIGIN` |
| Rejected | Static env `API_KEY` + forever `ApiKeyModule` / `ApiKeyGuard` |

### OpenAPI

- `setupOpenApi(app, options)` — Swagger UI `/api/docs`, JSON `/openapi.json`
- Runs **nestjs-zod** `cleanupOpenApiDoc` on the document
- Documents `x-api-key` and session cookie schemes

### Logging

`createLoggerModule()` — normative `LoggerModule.forRoot` defaults:

- Package: **`nestjs-pino`**
- `autoLogging: false`
- `pino-pretty` + `singleLine: true` when `NODE_ENV !== "production"`
- Level from `LOG_LEVEL` (default `info`)

## AppModule sketch

```typescript
@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    AuthModule,
    DatabaseModule,
    HealthModule,
    createLoggerModule(),
    // Feature modules…
  ],
})
export class AppModule {}
```

In `main.ts`: `mountBetterAuth(app, app.get(AUTH_INSTANCE))` and `setupOpenApi(app, { title, description })`.

## Scripts

| Script | Role |
|---|---|
| `pnpm --filter @helloworld/modules typecheck` | `tsc --noEmit` |
| `pnpm --filter @helloworld/modules build` | Emit `dist/` |
| `pnpm --filter @helloworld/modules smoke` | Nest DI smoke (Vitest + SWC, TS 7 decorators) |
| `pnpm --filter @helloworld/modules test` | Package Vitest suite |
