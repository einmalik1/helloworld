## 1. Shared error classes

- [x] 1.1 Add hand-authored `NotFound`, `ValidationError`, and `DatabaseError` (plus base if needed) in `packages/types/src/errors.ts`; export from package index
- [x] 1.2 Build/typecheck `@helloworld/types` so Nest can import error classes

## 2. Nest package scaffold

- [x] 2.1 Add `apps/api/package.json` (name `api`), Nest CLI/tsconfig, deps at tech-stack pins, workspace deps on `@helloworld/modules` / `@helloworld/types`
- [x] 2.2 Implement `configuration.ts` (`envSchema` / `AppConfig` per API README), `app.module.ts` (config → auth → database → health → logger), and `main.ts` bootstrap (Helmet, CORS, request-id, shutdown hooks, Zod pipe, filter, `mountBetterAuth`, `setupOpenApi`)

## 3. HTTP contract filter + ops

- [x] 3.1 Implement global `HttpExceptionFilter` under `src/common/filters/` (Problem Details, status map from typed errors, `requestId`, no string sniffing)
- [x] 3.2 Ensure fixed routes are public/wired: `GET /health`, `GET /api/docs`, `GET /openapi.json`; mark ops checklist items in API README as wired where accurate
- [x] 3.3 Add `openapi:export` script writing cleaned OpenAPI JSON to the documented path

## 4. Verification

- [x] 4.1 Add Nest/HTTP smoke (Vitest + `@nestjs/testing`, optional supertest) covering boot composition and Problem Details / fixed-route contract without requiring Coolify
- [x] 4.2 Run typecheck + build + smoke for `api` (and types if touched); fix until green
