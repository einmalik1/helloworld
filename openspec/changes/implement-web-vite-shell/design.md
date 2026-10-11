## Context

`apps/web` is a static stub (`npx serve` + `chat.html`). `@helloworld/api-client` exports an empty scaffold. Tech-stack and app READMEs already pin Vite 8.3.4, React 19.3, Tailwind 4.3 / shadcn, driver.js, Orval+ky, and cookie sessions. Issue #50 / Wave C: implement the shell + api-client without reopening ADRs 0001–0006. In-force ADRs: 0001–0008 (none superseded).

## Goals / Non-Goals

**Goals**

- Replace the web stub with a Vite React SPA shell (kit baseline, root-env public URLs).
- Implement api-client mutator + Orval pipeline + `dist/` emit per README sketches.
- Wire Better Auth browser client to `PUBLIC_API_URL`; keep chat entry aimed at `PUBLIC_CHAT_URL`.
- Package smoke: web `build`/`typecheck` + api-client `typecheck`/`build` (and generate skip-or-run).

**Non-Goals**

- Cytoscape graph explorer, domain CRUD screens, Storybook app, Coolify Dockerfile.
- Host Compose / Coolify deploy as agent smoke plane.
- Reopening facade ADRs 0001–0006; new durable ADRs unless something truly new appears (unlikely — stack already decided).
- Changing chat Nest service behavior.

## Decisions

1. **Vite app layout under `apps/web`**
   - Standard Vite React-TS layout: `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, Tailwind v4 entry CSS.
   - Keep `chat.html` as interim chat entry **or** add a `/chat` route that posts to `PUBLIC_CHAT_URL` with the same contract; prefer preserving `chat.html` served from `public/` so ADR 0008 interim path stays documented.
   - Alternatives: Next.js — rejected by tech-stack (Vite SPA).

2. **Env / Vite**
   - Load root `.env` via Vite `envDir: ../..` (repo root) and `envPrefix: ['PUBLIC_', 'VITE_']` (or map `PUBLIC_*` explicitly).
   - Do not add `apps/web/.env` as SoT.

3. **Auth**
   - `better-auth/react` (or `createAuthClient`) pointed at `PUBLIC_API_URL` with `credentials: "include"`.
   - Shell shows a minimal session status (signed-out placeholder); full login UI can stay minimal for this ticket.
   - Alternatives: api-key in localStorage — rejected (ADR 0003 cookie sessions for browsers).

4. **api-client**
   - Hand-write `src/http.ts` + `src/index.ts` per README; add `orval.config.ts`, deps `ky`, `orval`.
   - Export `configureClient`, `customFetch`, `fetchHealth`.
   - Run `openapi:export` from api when possible to seed `openapi.json` and generate; if export needs full env, commit generated only when export succeeds, otherwise hand client + skip generate remains valid smoke.
   - Web depends on workspace `@helloworld/api-client` and calls `configureClient({ apiUrl })` without apiKey (cookies).

5. **UI kit**
   - Tailwind 4 + shadcn init (minimal: button or similar) so the kit path exists; no full component inventory.
   - driver.js: add dependency + CSS import in shell (tours later); no tour scripts required now.

6. **Verification / smoke**
   - Gate: `pnpm --filter @helloworld/api-client typecheck && build` and `pnpm --filter @helloworld/web typecheck && build` (plus `smoke` scripts wrapping those if useful).
   - Prefer package-level smoke over inventing root `smoke` unless already present.

## Risks / Trade-offs

- **[Risk] openapi:export needs runtime env / Nest boot** → Mitigation: generate script already skips; implement hand mutator + empty/minimal generated placeholder only if Orval requires files; do not block shell on Coolify.
- **[Risk] Better Auth client version drift vs api modules** → Mitigation: pin same `better-auth` major as `packages/modules`.
- **[Risk] CORS / cookies not verified in unit smoke** → Mitigation: document; HTTP E2E later; smoke is build/typecheck.

## Migration Plan

1. Land api-client + web shell on automation branch; PR merge to `main`.
2. Developers: root `.env` from `.env.example`, `pnpm --filter @helloworld/web dev` with api running for session flows.
3. Rollback: revert PR; static `serve` stub returns.

## Open Questions

- None blocking: Dockerfile/Coolify Application deferred; graph explorer deferred to a later ticket.
