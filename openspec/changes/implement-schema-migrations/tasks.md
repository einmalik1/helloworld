## 1. Drizzle generator stage

- [x] 1.1 Add `generators.drizzle` config in `spark/repo-profile.yaml` and load it in `spark/generators/config.py`
- [x] 1.2 Implement `spark/generators/drizzle/` (Jinja templates + `generate.py`) emitting per-table Drizzle TS under `packages/modules/src/database/schema/`
- [x] 1.3 Wire stage into `spark/generators/__main__.py` / `ALL_STAGES` and root scripts `generate:drizzle` (+ include in default generate:code)
- [x] 1.4 Update `spark/generators/README.md` stage table and diagram for drizzle

## 2. Auth schema + package deps

- [x] 2.1 Add `drizzle-orm` / `drizzle-kit` (versions from tech-stack) to `@helloworld/modules` (and root as needed for kit CLI)
- [x] 2.2 Add `packages/modules/src/database/auth-schema.ts` (Better Auth 1.7.7 + api-key tables) and document CLI regenerate path in modules README
- [x] 2.3 Export schema entrypoints from `packages/modules/src` (domain schema index + auth-schema) without Nest DatabaseModule

## 3. drizzle-kit + migrate scripts

- [x] 3.1 Add root `drizzle.config.ts` pointing at domain schema + auth-schema, out dir `packages/modules/drizzle`, `DATABASE_URL`
- [x] 3.2 Add root scripts `db:generate` and `db:migrate`; document Coolify pre-deploy = `pnpm db:migrate`
- [x] 3.3 Run generate drizzle + `db:generate`; commit initial migration SQL under `packages/modules/drizzle/`
- [x] 3.4 Apply `pnpm db:migrate` when a Postgres `DATABASE_URL` is reachable; otherwise note skip in verification

## 4. Docs + verification

- [x] 4.1 Update `packages/modules/README.md` Database section (ownership paths + commands; no TBD/intent-only)
- [x] 4.2 Update `openspec/tech-stack.md` Database / generators rows (wired script names; drop TBD)
- [x] 4.3 Smoke: `pnpm generate:drizzle`, `pnpm --filter @helloworld/modules typecheck` (and build), plus migrate if DB available
