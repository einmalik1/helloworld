# modules

Reusable NestJS infrastructure for `apps/api` (and other Nest apps).

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesmodules).  
App conventions: [`apps/api/README.md`](../../apps/api/README.md#nestjs-conventions).  
Depends on `@helloworld/types` when wired.  
Build: `tsc` → `dist/` + subpath exports — [`Build / emit contract`](../../openspec/tech-stack.md#build--emit-contract).

## Layout

```text
src/
├── config/      # createAppConfigModule — Zod env at boot (from process.env / root .env)
├── database/    # DatabaseModule + DatabaseService (Drizzle + postgres.js)
├── health/      # HealthModule (@nestjs/terminus); routes marked @Public()
├── auth/        # Better Auth + @better-auth/api-key; global guard + @Public()
├── openapi/     # setupOpenApi — Swagger UI + JSON + nestjs-zod cleanupOpenApiDoc
└── index.ts
```

Subpath exports per module when implemented. Not for CLI/TUI — those use `@helloworld/api-client`.

## Module contracts (intent)

### Config

- `createAppConfigModule({ envSchema })` loads and validates **`process.env`**
- Callers start from the **repo root** so the single root `.env` is what Nest sees — this package does **not** read `apps/*/.env`
- Each app passes its own Zod `envSchema` (subset of root keys)

### Database

- Drizzle ORM + **postgres.js** (`postgres` package) + `DATABASE_URL` from config
- `DatabaseService` — injectable; domain query methods (no generic CRUD dump)
- **Schema ownership:** Drizzle TS under `packages/modules` aligned with `openspec/data-model/schema.sql` SoT; apply with **`drizzle-kit migrate`** — [ADR 0001](../../openspec/decisions/0001-schema-migrations.md). No runtime DDL.
- Domain use-cases live in `@helloworld/platform`, not as a generic CRUD dump here

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
