## ADDED Requirements

### Requirement: Config module validates caller Zod schema from process.env
`@helloworld/modules` MUST export `createAppConfigModule({ envSchema })` that validates `process.env` with the caller-supplied Zod schema at Nest boot and exposes typed `ConfigService` values. The module MUST NOT load `apps/*/.env` files.

#### Scenario: App passes envSchema
- **WHEN** a Nest app imports `createAppConfigModule({ envSchema })` and starts with root `.env` loaded into `process.env`
- **THEN** invalid required keys fail boot, and valid keys are available via Nest `ConfigService` without an app-local `.env`

### Requirement: Database module provides Drizzle access without runtime DDL
`@helloworld/modules` MUST export `DatabaseModule` and `DatabaseService` using Drizzle + postgres.js against `DATABASE_URL`, importing generated domain schema and auth schema. The service MUST close the pool on Nest destroy. Boot MUST NOT run `CREATE TABLE` / migrate SQL.

#### Scenario: DatabaseService injectable
- **WHEN** a Nest app imports `DatabaseModule`
- **THEN** feature code can inject `DatabaseService` for Drizzle queries against the already-migrated database

### Requirement: Health module exposes public GET /health
`@helloworld/modules` MUST export `HealthModule` that serves `GET /health` via `@nestjs/terminus` with process-up and DB-ping indicators, and MUST mark those routes `@Public()` so the global auth guard does not require credentials.

#### Scenario: Health without credentials
- **WHEN** the global auth guard is registered and a client calls `GET /health` without session or API key
- **THEN** the health endpoint responds with Terminus status (process + DB indicators) without auth failure

### Requirement: Auth module wires Better Auth guard and Public decorator
`@helloworld/modules` MUST export an Auth Nest module that creates a hand-written Better Auth instance (Drizzle adapter + `@better-auth/api-key`), registers a Nest **global** guard accepting session cookie **or** `x-api-key` via `verifyApiKey`, and exports `@Public()` to skip the guard. OpenAPI and Better Auth HTTP routes MUST be treatable as public. Static env `API_KEY` / forever `ApiKeyModule` MUST NOT be the product auth model.

#### Scenario: Public decorator skips guard
- **WHEN** a handler is marked `@Public()`
- **THEN** the global auth guard does not require a session or API key for that handler

### Requirement: OpenAPI setup helper cleans Zod document
`@helloworld/modules` MUST export `setupOpenApi(app, options)` that configures Swagger UI and JSON document export and runs nestjs-zod `cleanupOpenApiDoc` on the document. Auth schemes documented MUST be consistent with Better Auth (`x-api-key` / session).

#### Scenario: setupOpenApi from bootstrap
- **WHEN** an app `main.ts` calls `setupOpenApi(app, { title, description })`
- **THEN** Swagger UI and OpenAPI JSON are available on the documented paths with a cleaned Zod-compatible document

### Requirement: Shared logger helper matches nestjs-pino defaults
When `@helloworld/modules` exports a shared logger bootstrap helper, it MUST match the normative nestjs-pino defaults (`autoLogging: false`, `pino-pretty` + `singleLine` when `NODE_ENV !== "production"`, level from `LOG_LEVEL` default `info`).

#### Scenario: Logger helper used by Nest app
- **WHEN** an app imports the shared logger helper instead of inlining `LoggerModule.forRoot`
- **THEN** Pino configuration matches the API README normative defaults

## MODIFIED Requirements

### Requirement: Modules package provides Nest infra
`@helloworld/modules` MUST provide reusable Nest modules/helpers for config validation from root env, database access, health checks, Better Auth wiring, OpenAPI setup, and optional nestjs-pino logging for Nest apps. Package exports and README MUST name these surfaces as wired (not deferred “later” placeholders).

#### Scenario: API depends on modules for boot infra
- **WHEN** `apps/api` is scaffolded
- **THEN** it boots using `@helloworld/modules` for config/db/health/auth/openapi (and shared logging if extracted) rather than reimplementing those cross-cuts inline
