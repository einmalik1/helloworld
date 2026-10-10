# modules

Reusable NestJS infrastructure for `apps/api` (and other Nest apps).

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesmodules).  
App conventions: [`apps/api/README.md`](../../apps/api/README.md#nestjs-conventions).  
Depends on `@helloworld/types` when wired.  
Build: `tsc` → `dist/` + subpath exports — [`Build / emit contract`](../../openspec/tech-stack.md#build--emit-contract).

## Layout

```text
src/
├── config/      # createAppConfigModule — Zod env at boot (from process.env / root .env) — later
├── database/
│   ├── schema/          # domain Drizzle TS from generator (schema.sql → drizzle stage)
│   ├── auth-schema.ts   # Better Auth CLI SoT (not in schema.sql)
│   └── schema-entry.ts  # combined entry for drizzle-kit
├── health/      # HealthModule (@nestjs/terminus); routes marked @Public() — later
├── auth/        # Better Auth + @better-auth/api-key; global guard + @Public() — later
├── openapi/     # setupOpenApi — Swagger UI + JSON + nestjs-zod cleanupOpenApiDoc — later
└── index.ts     # re-exports domain + auth schema (Nest modules land later)
```

Keep **domain** and **auth** Drizzle schemas as separate files. Subpath exports: `@helloworld/modules/database/schema`, `@helloworld/modules/database/auth-schema`. Not for CLI/TUI — those use `@helloworld/api-client`.

## Module contracts (intent)

### Config

- `createAppConfigModule({ envSchema })` loads and validates **`process.env`**
- Callers start from the **repo root** so the single root `.env` is what Nest sees — this package does **not** read `apps/*/.env`
- Each app passes its own Zod `envSchema` (subset of root keys)

### Database

- Drizzle ORM **0.45.3** + drizzle-kit **0.31.11** (root scripts); Nest `DatabaseService` + postgres.js land with Nest modules wiring  
- **Domain schema:** `pnpm generate:drizzle` (or full `pnpm generate`) writes [`src/database/schema/`](src/database/schema/) from [`openspec/data-model/schema.sql`](../../openspec/data-model/schema.sql) — do not hand-edit those files  
- **Auth schema:** [`src/database/auth-schema.ts`](src/database/auth-schema.ts) — Better Auth owned; regenerate with `pnpm dlx auth@1.7.7 generate --output packages/modules/src/database/auth-schema.ts` (pass `--config` once the Auth instance exists). **Do not** merge auth DDL into `schema.sql`  
- **Migrations:** root `drizzle.config.ts` → SQL under [`drizzle/`](drizzle/); apply with **`pnpm db:migrate`** (`pnpm db:generate` after schema changes). Coolify **pre-deploy** for apps that need the DB runs the same `pnpm db:migrate` — **no** runtime DDL in Nest lifecycle  
- Spec + ADR: [`tech-stack.md` § Database / Drizzle](../../openspec/tech-stack.md#database--drizzle-schema--migrations), [`decisions/0001-schema-migrations.md`](../../openspec/decisions/0001-schema-migrations.md)  
- New-resource checklist (SQL → generate → migrate → queries): [`spark/agents/common/conventions.md`](../../spark/agents/common/conventions.md#new-resource-workflow)

### Health (normative)

`GET /health` via `@nestjs/terminus` (**12.1.0**). Controller (or routes) use **`@Public()`** so the global auth guard does not require a session/key.

| Indicator | v1 | Notes |
|---|---|---|
| Process up | **yes** | Terminus liveness — process is serving |
| DB ping | **yes** | Postgres reachability via `DATABASE_URL` (postgres.js / `DatabaseService`) |
| Memory / heap metrics | **no** | Skip fancy utilization indicators in v1 unless Coolify later requires them |

Contract:

- Path: **`GET /health`** (same fixed route as [`apps/api` HTTP contract](../../apps/api/README.md#fixed-infrastructure-routes))
- Auth: **`@Public()`** only — no session or API key
- Response: Terminus status payload (`status` + indicator results); Coolify HTTP health hits this path
- Clients: CLI/TUI probe with the api-client **3s** health timeout — see [`packages/api-client` Timeouts](../api-client/README.md#timeouts-normative)

### Auth

Hand-written Better Auth wiring (no community Nest Better Auth package). Spec inventory: [`tech-stack.md` § Auth](../../openspec/tech-stack.md#auth-better-auth). Rationale vs static `API_KEY`: [`decisions/0003-better-auth.md`](../../openspec/decisions/0003-better-auth.md).

| Concern | Contract |
|---|---|
| Packages | `better-auth` **1.7.7** + `@better-auth/api-key` **1.7.7** |
| Instance | Create and export a Better Auth instance from this package’s `auth/` module; mount Better Auth HTTP handlers so Better Auth stays SoT for auth routes |
| Adapter | Official **Drizzle** adapter; schema file from `@better-auth/cli` (e.g. `database/auth-schema.ts`) — see [Database](#database) |
| Global guard | Nest **global** guard: accept **session cookie** (web) **or** API key via `auth.api.verifyApiKey` (machines) |
| API key header | **`x-api-key`** only (frozen; matches [`packages/api-client`](../api-client/README.md#auth-header--configureclient)) |
| `@Public()` | Decorator exported here — skip the global guard per handler/controller |
| Public by default | `GET /health` (Health module), Better Auth HTTP routes, OpenAPI (`/api/docs`, `/openapi.json`) |
| Origins | `trustedOrigins` / CORS driven by Nest config `WEB_ORIGIN` (see [`apps/api` env](../../apps/api/README.md#configuration-root-env)) |
| Rejected | Static env `API_KEY` + forever `ApiKeyModule` / `ApiKeyGuard` as the product auth model |

Key issue/revoke UX lives in web (settings) or an authenticated CLI subcommand — not in this package. CLI/TUI store issued keys in `@helloworld/terminal/config` ([terminal README](../terminal/README.md#config-keys-normative)).

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
