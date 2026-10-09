# modules

Reusable NestJS infrastructure for `apps/api` (and other Nest apps).

Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagesmodules).  
App conventions: [`apps/api/README.md`](../../apps/api/README.md#nestjs-conventions).  
Depends on `@helloworld/types` when wired.  
Build: `tsc` → `dist/` + subpath exports — [`Build / emit contract`](../../spec/tech-stack.md#build--emit-contract).

## Layout

```text
src/
├── config/      # createAppConfigModule — Zod env at boot (from process.env / root .env)
├── database/    # DatabaseModule + DatabaseService (Drizzle + postgres.js)
│   ├── schema/  # domain Drizzle TS from generator (schema.sql → drizzle stage) — intent
│   └── auth-schema.ts   # Better Auth CLI output (separate SoT) — intent
├── health/      # HealthModule (@nestjs/terminus); routes marked @Public()
├── auth/        # Better Auth + @better-auth/api-key; global guard + @Public()
├── openapi/     # setupOpenApi — Swagger UI + JSON + nestjs-zod cleanupOpenApiDoc
└── index.ts
```

Exact file names under `database/` settle when wiring; keep **domain** and **auth** Drizzle schemas as separate files. Subpath exports per module when implemented. Not for CLI/TUI — those use `@helloworld/api-client`.

## Module contracts (intent)

### Config

- `createAppConfigModule({ envSchema })` loads and validates **`process.env`**
- Callers start from the **repo root** so the single root `.env` is what Nest sees — this package does **not** read `apps/*/.env`
- Each app passes its own Zod `envSchema` (subset of root keys)

### Database

- Drizzle ORM + **postgres.js** (`postgres` package) + `DATABASE_URL` from config  
- `DatabaseService` — injectable; domain query methods (no generic CRUD dump)  
- **Domain schema:** generated from [`spec/erd/schema.sql`](../../spec/erd/schema.sql) via the `drizzle` generator stage into this package — do not hand-maintain domain tables as the primary SoT  
- **Auth schema:** `@better-auth/cli generate` → e.g. `auth-schema.ts` here; auth tables = Better Auth owned (not merged into `schema.sql`)  
- **Migrations:** `drizzle-kit migrate` via a shared root/package script (intent name `pnpm db:migrate`); Coolify pre-deploy runs the same script — **no** runtime DDL in Nest lifecycle  
- Spec + ADR: [`tech-stack.md` § Database / Drizzle](../../spec/tech-stack.md#database--drizzle-schema--migrations), [`decisions/0001-schema-migrations.md`](../../spec/decisions/0001-schema-migrations.md)  
- New-resource checklist (SQL → generate → migrate → queries): process **#6** / [GH #13](https://github.com/einmalik1/helloworld/issues/13)

### Health

- `GET /health` via `@nestjs/terminus` (e.g. Node utilization / DB ping as chosen)  
- Controller (or routes) use **`@Public()`** so the global auth guard does not require a session/key

### Auth

- Better Auth + `@better-auth/api-key`  
- Global guard: session and/or `verifyApiKey`  
- **`@Public()`** decorator — opt out per handler/controller  
- Not a single static env API key for all traffic

### OpenAPI

- `setupOpenApi(app, options)` — Swagger UI (e.g. `/api/docs`), JSON export (e.g. `/openapi.json` or build-time `openapi:export`)  
- Run **nestjs-zod** `cleanupOpenApiDoc` on the document so Orval/Swagger see clean schemas  
- Document API-key / auth schemes consistent with Better Auth clients

### Logging (optional)

If a shared bootstrap helper is extracted here (instead of inlining in each app’s `AppModule`), it must match the **normative** `LoggerModule.forRoot` defaults in [`apps/api/README.md`](../../apps/api/README.md#loggermodule-defaults--normative):

- Package: **`nestjs-pino`**
- `autoLogging: false`
- `pino-pretty` + `singleLine: true` when `NODE_ENV !== "production"`
- Level from `LOG_LEVEL` (default `info`)

Apps that stay Nest without HTTP (worker) reuse the same helper / defaults.
