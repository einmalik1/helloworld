## Why

Wave A shipped Nest Auth wiring and API bootstrap, but machine clients still have only a README sketch for `configureClient` / `x-api-key`, and auth routes/guards lack a focused verification gate. Wave B domain tickets need a frozen Better Auth path (public auth HTTP + global guard + api-client header) before protected CRUD lands.

## What Changes

- Harden `@helloworld/modules` Better Auth instance + Nest mount so `/api/auth/*` is the SoT for auth HTTP (session + API-key plugin), with `basePath` aligned to the mount.
- Keep the Nest **global** guard accepting session cookie **or** `x-api-key` via `verifyApiKey`; ensure infrastructure public paths (`/health`, `/api/auth`, OpenAPI) stay anonymous.
- Implement `packages/api-client` hand-written ky mutator (`src/http.ts`): `configureClient({ apiUrl, apiKey? })` sets **`x-api-key`** when provided; export from package index.
- Wire/confirm `apps/api` continues to mount Better Auth and documents OpenAPI `x-api-key` (no static env `API_KEY` product model).
- Add package smokes covering guard public paths / 401 on protected routes (mocked auth) and api-client header mutator.
- Do **not** build web key-settings UI, CLI/TUI key store UX, or domain CRUD; do **not** re-open ADRs 0001–0006.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `auth-better-auth`: Pin mounted Better Auth HTTP routes under `/api/auth`, Nest global guard session-or-`x-api-key` behaviour, and api-client `configureClient` header contract as normative (beyond baseline model wording).

## Impact

- Primary: `packages/modules` (auth instance/mount/guard), `packages/api-client` (`http.ts` + deps), light `apps/api` smoke/README if needed.
- Consumes: existing AuthModule / `mountBetterAuth` / OpenAPI from Wave A.
- Unlocks: Wave B domain CRUD and later CLI/TUI against a real `configureClient`.
- Out of scope: web settings UI, terminal config UX, Orval-generated client regeneration, Coolify deploy as smoke plane.
