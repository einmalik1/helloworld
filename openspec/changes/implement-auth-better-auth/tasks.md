## 1. Modules auth harden

- [x] 1.1 Align `createAuth` with mount: set `basePath: "/api/auth"`, enable `emailAndPassword`, keep `@better-auth/api-key` with header `x-api-key`
- [x] 1.2 Confirm `AuthGuard` public infrastructure paths + session-or-`verifyApiKey` behaviour; add/adjust modules or api smoke for 401 on protected probe and public `/api/auth` path handling

## 2. api-client key header

- [x] 2.1 Add `ky@2.1.0` to `@helloworld/api-client`; implement `src/http.ts` (`configureClient`, `customFetch`, `fetchHealth`, timeouts) per package README
- [x] 2.2 Export mutator surface from `src/index.ts`; add Vitest smoke asserting `x-api-key` set/omitted; add package `smoke` script

## 3. API wiring + verification

- [x] 3.1 Confirm `apps/api` mounts Better Auth + OpenAPI `x-api-key`; update README only if contracts drifted
- [x] 3.2 Run typecheck/build/smoke for touched packages (`modules`, `api-client`, `api`); fix until green
