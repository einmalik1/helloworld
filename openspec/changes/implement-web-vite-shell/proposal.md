## Why

Wave C needs a real browser surface: `apps/web` is still a static placeholder (`serve` + `chat.html`), and `@helloworld/api-client` has no ky/Orval wiring. Without a Vite React shell and typed HTTP client, auth sessions, domain UI, and chat (ADR 0008) cannot land on the documented stack.

## What Changes

- Scaffold `apps/web` as a Vite 8.3 + React 19.3 SPA with Tailwind CSS 4 / shadcn kit baseline, port `5173`, env from root `.env` (`PUBLIC_API_URL`, `PUBLIC_CHAT_URL`, `WEB_*`).
- Wire Better Auth **cookie-session** client path to `apps/api` (no `packages/terminal`, no static `API_KEY`).
- Implement `@helloworld/api-client`: ky mutator (`configureClient`, `x-api-key`, timeouts), Orval config/generate pipeline, `tsc` emit to `dist/`, public facade.
- Keep chat as a client of `apps/chat` only (preserve or migrate `chat.html` into the SPA shell without vendor LLM URLs) — ADR 0008.
- Add package smoke (Vite build / client typecheck+build) as the pre-merge gate; do **not** re-open facade ADRs 0001–0006.
- Do **not** implement Cytoscape graph explorer, full CRUD screens, Storybook app, or Coolify Dockerfile unless required for local smoke.

## Capabilities

### New Capabilities

- `web-vite-shell`: Vite React SPA shell in `apps/web` (kit baseline, env, auth session client, chat entry that calls `apps/chat` only).

### Modified Capabilities

- `build-emit`: Pin that `@helloworld/api-client` emits via Orval → `tsc` → `dist/`, and `apps/web` emits via `vite build` (not Nest `dist/main.js`).

## Impact

- Primary: `apps/web`, `packages/api-client`; light README updates.
- Consumes: `apps/api` OpenAPI export (when present), Better Auth session contract, `PUBLIC_*` env.
- Unlocks: later Wave C UI (graph explorer, domain screens) and CLI/TUI against a real api-client.
- Out of scope: engine SDKs in the browser, `packages/terminal` in web, LLM provider calls from web, ADRs 0001–0006 reopen.
