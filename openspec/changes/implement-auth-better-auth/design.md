## Context

Wave A (`#38`–`#40`) shipped auth schema, Nest AuthModule (createAuth + global AuthGuard + `mountBetterAuth` + `@Public()`), and `apps/api` bootstrap that mounts Better Auth and documents OpenAPI `x-api-key`. `@helloworld/api-client` still exports an empty scaffold; README documents `http.ts` / `configureClient` as a sketch only. Ticket `#41` focus: Better Auth routes, guards, api-client key header — not web/CLI key lifecycle UX.

In-force ADRs: **0001** (auth tables Better Auth–owned), **0003** (sessions + managed keys; header `x-api-key`; no static `API_KEY` product model). Do not re-open 0001–0006.

## Goals / Non-Goals

**Goals:**

- Align Better Auth instance `basePath` with Nest mount `/api/auth`; enable email/password so session routes are usable.
- Keep global guard session-or-`x-api-key` with infrastructure public paths; add focused guard/smoke coverage.
- Implement `packages/api-client/src/http.ts` + index exports per README (`ky` **2.1.0**, timeouts 30s / health 3s, `x-api-key` mutator).
- Verify with package typecheck/build + smokes (modules and/or api auth contract; api-client header unit smoke).

**Non-Goals:**

- Web settings UI for issue/revoke keys; CLI/TUI terminal config UX (`implement-cli-tui-thin`).
- Domain CRUD controllers; Orval full client generation beyond transport mutator.
- Replacing chat’s local auth with modules AuthModule in this ticket.
- Coolify deploy as the agent smoke plane; host Compose as required gate.
- New durable ADRs (0003 remains SoT).

## Decisions

1. **Reuse Wave A AuthModule** — harden `createAuth` (`basePath: "/api/auth"`, `emailAndPassword: { enabled: true }`) and keep `mountBetterAuth` / `AuthGuard` as the Nest surface. Do not introduce a community Nest Better Auth wrapper.

2. **api-client transport lands now** — add `ky@2.1.0` to `@helloworld/api-client`; implement README sketch as real `src/http.ts`; re-export `configureClient`, `customFetch`, `fetchHealth`, timeout constants from `src/index.ts`. Orval `generated/` remains optional/empty until OpenAPI consumers need it.

3. **Smoke strategy:**
   - `packages/api-client`: Vitest unit smoke that stubs fetch/ky hooks (or inspects beforeRequest) to assert `x-api-key` presence/absence.
   - `apps/api` or `packages/modules`: extend/add smoke that a non-`@Public` probe returns 401 without credentials, and `/api/auth` path is treated as public by the guard (mount may be exercised lightly; DB-backed verifyApiKey success path may mock `AUTH_INSTANCE`).
   - Gate scripts: package `typecheck` + `build` + `smoke` for touched packages.

4. **Static API_KEY remains rejected** — no product `ApiKeyModule` / env shared secret; OpenAPI keeps documenting `x-api-key` + session cookie.

5. **Key lifecycle UX deferred** — creating/revoking keys via Better Auth APIs is available through mounted auth routes once sessions exist; operator storage stays `@helloworld/terminal/config` for Wave C tools.

## Risks / Trade-offs

- **[Risk] verifyApiKey / session calls need live Postgres** → Mitigation: unit-smoke with mocked `AUTH_INSTANCE` for 401/public-path; do not require Coolify for green gate.
- **[Risk] Nest body parser vs Better Auth handler** → Mitigation: keep Wave A `toNodeHandler` mount; do not wrap auth routes as Nest controllers.
- **[Trade-off] Full E2E key issue/verify** → Defer to later env with migrated DB; this ticket freezes the header + guard + mount contract.
- **[Risk] Scope creep into CLI/web** → Mitigation: only api-client mutator + modules/api auth wiring; no terminal/web UI.

## Migration Plan

1. Land modules harden + api-client http + smokes on automation branch; PR merge.
2. Domain tickets rely on global guard; tools later call `configureClient`.
3. Rollback: revert package commits; no schema.sql / migration changes expected (auth-schema already present).

## Open Questions

- None blocking. ADR 0003 remains in force; no supersession needed.
