# Design

## Context

See `proposal.md` for motivation. Today: pnpm workspaces exist (`apps/*`, `tools/*`, `packages/*`, `tests/*`); root scripts are mostly `generate*` + a recursive `typecheck`; `@helloworld/config` declares exports that point at missing files; library `exports` still target `./src/*.ts`; no `turbo.json`; no Compose file for `infra/postgres` + `infra/s3`; `.env.example` and README already describe the intended contracts in `spec/tech-stack.md` (Build / emit, Monorepo tasks, Root environment).

Generated Nest DTOs under `apps/api/src/*/dto` exist, but there is no Nest app entry/`package.json` yet — this change does not scaffold Nest runtime.

## Goals / Non-Goals

**Goals:**

- Make `@helloworld/config` real and reusable.
- Wire Turbo + root scripts so `build` / `dev` / quality gates match the documented intent.
- Flip emitting libraries to `dist/` exports with working `tsc` builds (stubs may remain empty modules).
- Add Compose + root `docker:local:*` for Postgres and MinIO-compatible S3 aligned with `.env.example`.

**Non-Goals:**

- Nest `createAppConfigModule` / Zod `envSchema` (next wave: modules).
- Drizzle schema, migrations, Better Auth tables.
- Runnable `apps/api` / `apps/web` / worker binaries beyond optional Turbo filter placeholders.
- Coolify/production Dockerfiles.
- Changing generator pipelines or ERD content.

## Decisions

### 1. Turbo at repo root with package scripts as leaves

- **Choice:** Add `turbo.json` at root; each workspace that participates defines `build` / `typecheck` / `lint` / `test` / `dev` as applicable; root `package.json` scripts call `turbo run <task>`.
- **Why:** Matches `spec/tech-stack.md` Monorepo tasks; `dependsOn: ["^build"]` is the standard way to enforce library-before-app.
- **Alternatives:** Only `pnpm -r run` without Turbo — rejected because README/stack already commit to Turbo caching and `^build`.

### 2. Shared config via `@helloworld/config` file exports

- **Choice:** Add `tsconfig.base.json`, `vitest.config.ts` (SWC-ready base for future Nest tests), `oxlintrc.json` under `packages/config`; keep exports as today (no emit).
- **Why:** Already specified in package README and tech-stack; avoids duplicating strict ESM/`nodenext` settings.
- **Alternatives:** Root-only configs without a package — rejected; workspaces need a stable import path.

### 3. Library emit with `tsc` + `nodenext` + `.js` import suffixes

- **Choice:** Each emitting package gets `tsconfig.json` extending the shared base, `build`: `tsc -p tsconfig.json`, `typecheck`: `tsc --noEmit`, flip `exports` to `./dist/...`. Use `"type": "module"`.
- **Why:** Build/emit contract in tech-stack; Nest apps later need decorator metadata — enable in base or Nest-specific tsconfig extension when modules land (modules package may enable decorators now if its tsconfig is Nest-oriented).
- **Alternatives:** Keep `exports` → `src` for DX — rejected; contract explicitly forbids permanent src exports. `tsup`/bundler for libs — deferred; stack says `tsc` → `dist/`.

### 4. Minimal stub builds are enough

- **Choice:** Empty or near-empty `src/index.ts` stubs MUST still compile and emit; do not implement Nest modules/auth in this change.
- **Why:** Unblocks dependent builds and validates the graph without expanding scope.
- **Alternatives:** Full modules implementation here — belongs in a later change.

### 5. Compose file at repo root (or `infra/docker-compose.yml`) referenced by root scripts

- **Choice:** One Compose file defining `postgres` and `s3` (MinIO or equivalent) with ports/credentials matching `.env.example`; `pnpm run docker:local:up` → `docker compose … up -d`; `down` symmetrically. Prefer `infra/docker-compose.yml` + `-f` from root so infra stays the home for data services.
- **Why:** README already documents these script names; infra READMEs exist as placeholders.
- **Alternatives:** Per-service compose only under each infra folder — awkward for one `up` command; Coolify-only local — fails offline/dev laptop loop.

### 6. Apps without package.json stay outside Turbo filters

- **Choice:** Do not invent fake `apps/web/package.json` solely for Turbo unless needed; wire Turbo for packages that already have `package.json` (`packages/*`). Root `dev`/`build` MAY be no-op or package-only until apps are scaffolded.
- **Why:** Avoids hollow app scaffolds that diverge from later real Nest/Vite/Next choices.
- **Alternatives:** Scaffold empty package.json for every app now — deferred to component changes.

### 7. Tool versions from tech-stack inventory

- **Choice:** Pin `turbo@2.11.6`, `typescript@7.0.2`, `oxlint@1.86.0`, `oxfmt@0.71.0`, `vitest@5.0.3` (and SWC-related Vitest pieces as needed) consistent with `spec/tech-stack.md`.
- **Why:** Spec already chose versions; lockfile should match when wiring.

## Risks / Trade-offs

- **[Risk] Empty apps mean root `dev` does little** → Mitigation: document that Wave 0 validates packages + infra; app `dev` arrives with Nest/web scaffolds. Script can still exist and run Turbo over whatever defines `dev`.
- **[Risk] Flipping exports to `dist/` breaks any ad-hoc TS path imports** → Mitigation: almost no real consumers yet; regenerate/ensure workspace deps use package names only.
- **[Risk] Compose image tags drift from Coolify Postgres 18 / Garage** → Mitigation: local images are stand-ins; document that QA/Prod use Coolify services, not this Compose file.
- **[Risk] Oxfmt/Oxlint CLI flags change** → Mitigation: keep scripts thin; adjust in follow-up if CLI differs.

## Migration Plan

1. Land `packages/config` files and extend package tsconfigs.
2. Add build scripts + flip exports package-by-package (`types` first as leaf).
3. Add `turbo.json` + root scripts; `pnpm install` for new deps.
4. Add Compose + `docker:local:*`; verify against `.env.example`.
5. Run `pnpm run build` and `pnpm run typecheck` as acceptance for this change.
6. Rollback: revert the change branch; no production deploy yet.

## Open Questions

- Exact MinIO vs alternatives for local S3 — default MinIO unless infra README already constrains (none found); Garage stays Coolify-only.
- Whether root `format`/`lint` use Turbo pipelines or direct oxfmt/oxlint globs — either satisfies the spec if invoked from root; prefer Turbo tasks when packages define scripts, with a root fallback glob for early repos.
