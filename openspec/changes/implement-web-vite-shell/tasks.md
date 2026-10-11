## 1. api-client SDK

- [x] 1.1 Add deps (`ky`, `orval`) and scripts; implement `src/http.ts` (`configureClient`, `customFetch`, `fetchHealth`, timeouts, `x-api-key`) and `src/index.ts` facade per package README
- [x] 1.2 Add `orval.config.ts`; ensure `scripts/generate.mjs` runs Orval when `apps/api/openapi.json` exists
- [x] 1.3 Export OpenAPI from api when feasible and run generate; keep skip-success path when OpenAPI missing; `tsc` build to `dist/`

## 2. Vite React shell

- [x] 2.1 Replace `apps/web` stub with Vite 8.3 + React 19.3 + `@vitejs/plugin-react`; root `envDir` for `PUBLIC_*`; scripts `dev`/`build`/`typecheck`/`smoke`
- [x] 2.2 Add Tailwind CSS 4 + minimal shadcn kit baseline; optional driver.js CSS import; preserve chat entry to `PUBLIC_CHAT_URL` (public `chat.html` or SPA route) with no vendor LLM URLs
- [x] 2.3 Wire Better Auth React client to `PUBLIC_API_URL` (cookies); depend on `@helloworld/api-client` and `configureClient({ apiUrl })` without terminal package

## 3. Docs and verification

- [x] 3.1 Update `apps/web/README.md` and `packages/api-client/README.md` where “scaffolding later” is now wired
- [x] 3.2 Run api-client + web typecheck/build/smoke until green
