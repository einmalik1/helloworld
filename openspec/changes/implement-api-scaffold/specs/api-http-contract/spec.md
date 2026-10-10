## ADDED Requirements

### Requirement: Nest API process boots from shared modules

`apps/api` MUST be a NestJS 12 Express application that boots via `main.ts` / `AppModule`, validates env with a Zod `envSchema` in `configuration.ts` through `createAppConfigModule`, and imports `@helloworld/modules` in normative order: config → Auth → Database → Health → logger. The process MUST NOT load `apps/api/.env`.

#### Scenario: AppModule composes modules

- **WHEN** the API process starts from the repo root with a valid root `.env`
- **THEN** Nest boots using `@helloworld/modules` for config, auth, database, health, and logging without an app-local env file

### Requirement: Global Problem Details exception filter

`apps/api` MUST register a global HTTP exception filter under `src/common/filters/` that maps `@helloworld/types` error classes and Nest/nestjs-zod validation failures to RFC 9457 Problem Details (`application/problem+json`) using the status map (validation → 400, not found → 404, database/unknown → 500). Status MUST NOT be inferred by parsing error message text. Bodies MUST include `requestId`.

#### Scenario: Typed not-found maps to 404 Problem Details

- **WHEN** a handler throws or maps a typed not-found error from `@helloworld/types`
- **THEN** the response is `application/problem+json` with HTTP 404 and a `requestId` extension matching `x-request-id`

### Requirement: Security and ops baseline at bootstrap

`apps/api` bootstrap MUST enable Helmet, CORS reflecting single `WEB_ORIGIN` with credentials, accept-or-generate `x-request-id` (echo on response; bind for logs/filter), `enableShutdownHooks()`, mount Better Auth HTTP handlers, register global `ZodValidationPipe`, and call `setupOpenApi` for `/api/docs` and `/openapi.json`.

#### Scenario: Bootstrap exposes documented fixed routes

- **WHEN** the API has started successfully
- **THEN** `GET /health` (public), `GET /api/docs`, and `GET /openapi.json` are available without inventing alternate paths

### Requirement: OpenAPI export script for Orval

`apps/api` MUST provide an `openapi:export` script (or equivalent documented package script) that writes a cleaned OpenAPI document to a stable path consumable by `pnpm generate:client` / Orval.

#### Scenario: openapi:export writes document

- **WHEN** a developer runs the package OpenAPI export script after a successful build/boot path
- **THEN** an OpenAPI JSON file is written at the documented location for client generation

## MODIFIED Requirements

### Requirement: Fixed infrastructure routes

The API MUST expose `GET /health` (public), `GET /api/docs` (Swagger UI), and `GET /openapi.json` (OpenAPI document) as the documented fixed routes. These routes MUST be wired by the Nest scaffold (`HealthModule` + `setupOpenApi` + `@Public()` where auth would otherwise apply), not left as documentation-only placeholders.

#### Scenario: Health is reachable without auth

- **WHEN** an unauthenticated client calls `GET /health`
- **THEN** the endpoint responds without requiring a session or API key
