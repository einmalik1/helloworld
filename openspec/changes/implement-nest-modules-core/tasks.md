## 1. Package deps + exports

- [x] 1.1 Add Nest / Drizzle driver / Better Auth / OpenAPI / Pino deps to `@helloworld/modules` at tech-stack pins (`@nestjs/*`, `postgres`, `better-auth`, `@better-auth/api-key`, `nestjs-zod`, `nestjs-pino`, `pino`, `pino-pretty`, `@nestjs/terminus`, `@nestjs/swagger`, `zod` as needed)
- [x] 1.2 Extend `package.json` exports / `src/index.ts` for Nest module surfaces while keeping schema subpath exports

## 2. Config + Database + Logging

- [x] 2.1 Implement `createAppConfigModule({ envSchema })` (Zod validate `process.env`, no `apps/*/.env`)
- [x] 2.2 Implement `DatabaseModule` + `DatabaseService` (Drizzle + postgres.js, domain + auth schema, pool cleanup, no runtime DDL)
- [x] 2.3 Implement shared nestjs-pino logger helper matching API README normative defaults

## 3. Health + Auth + OpenAPI

- [x] 3.1 Implement `HealthModule` (`GET /health` via Terminus: process + DB ping, `@Public()`)
- [x] 3.2 Implement Auth module: Better Auth instance (Drizzle adapter + api-key plugin), global guard (session or `x-api-key`), `@Public()`, mount helper for Better Auth HTTP routes
- [x] 3.3 Implement `setupOpenApi(app, options)` with nestjs-zod `cleanupOpenApiDoc` and auth scheme docs

## 4. Docs + verification

- [x] 4.1 Update `packages/modules/README.md` layout/contracts (remove “later” for wired modules; document exports + smoke)
- [x] 4.2 Add Nest DI smoke (Vitest + `@nestjs/testing`) under `packages/modules`; wire package `test`/`smoke` script as needed
- [x] 4.3 Run typecheck + build + smoke for `@helloworld/modules`; fix until green
