# Tasks

## 1. Shared tooling config

- [x] 1.1 Add `packages/config/tsconfig.base.json` (strict, ESM, `nodenext`, decorator flags for Nest consumers) and verify `@helloworld/config` export `./tsconfig` resolves to that file
- [x] 1.2 Add `packages/config/vitest.config.ts` and `packages/config/oxlintrc.json` matching package exports; verify files exist at the exported paths
- [x] 1.3 Update `packages/config/README.md` if paths differ from intent; verify README export table matches `package.json` exports

## 2. Library build/emit flip

- [x] 2.1 Wire `@helloworld/types`: extend shared tsconfig, add `build` (`tsc`) + keep `typecheck` (`tsc --noEmit`), flip `exports` to `dist/`; verify `pnpm run --filter @helloworld/types build` creates `packages/types/dist/` and `typecheck` passes
- [x] 2.2 Wire `@helloworld/modules` the same way (Nest decorator tsconfig options on); verify `build` emits `dist/` and `exports` no longer point at `src/`
- [x] 2.3 Wire `@helloworld/terminal` the same way including subpath exports (`config` / `log` / `tty`); verify build emits and subpath exports resolve under `dist/`
- [x] 2.4 Wire `@helloworld/api-client` (`build` after generate remains separate); verify `build` emits `dist/` and main export points at `dist/`
- [x] 2.5 Ensure `dist/` remains gitignored (root `.gitignore`); verify `git check-ignore -v packages/types/dist` (or equivalent) reports ignored

## 3. Turborepo and root scripts

- [x] 3.1 Add root `turbo` dependency (version from tech-stack) and `turbo.json` with `build` (`dependsOn: ["^build"]`, `outputs: ["dist/**"]`), `dev` (persistent, uncached), plus `typecheck` / `lint` / `test` / `format` pipelines as applicable; verify `turbo.json` validates (`pnpm exec turbo run build --dry-run` or equivalent)
- [x] 3.2 Add root scripts `build`, `dev`, `test`, `lint`, `format` (and keep/align `typecheck`) invoking Turbo or documented fallbacks; verify `pnpm run build` and `pnpm run typecheck` succeed from repo root for wired packages
- [x] 3.3 Add `oxlint` / `oxfmt` (and workspace TypeScript as needed) so `lint` / `format` run from root; verify each script exits 0 on the current tree or documents required package script presence

## 4. Local Compose runtime

- [x] 4.1 Add Compose definition under `infra/` for Postgres and S3-compatible MinIO (or equivalent) with credentials/ports aligned to `.env.example`; verify `docker compose -f <file> config` succeeds
- [x] 4.2 Add root scripts `docker:local:up` and `docker:local:down` pointing at that Compose file; verify script names exist in root `package.json`
- [x] 4.3 Update `infra/postgres` and `infra/s3` READMEs to point at the Compose file and root scripts; verify READMEs mention `pnpm run docker:local:up`
- [x] 4.4 Document verification path: agent/CI smoke uses Coolify **test** environment from `spark/repo-profile.yaml` (not host Compose on the Orca/Coolify server); local `docker:local:*` remains laptop-only — verify profile lists `test` and infra READMEs state this split

## 5. Integration check

- [x] 5.1 From a clean install mindset: `pnpm install`, `pnpm run build`, `pnpm run typecheck` — verify all three succeed for the emitting packages
- [x] 5.2 Confirm root README script table still matches reality (update only if scripts were renamed); verify listed commands `build`, `typecheck`, `docker:local:up`, `docker:local:down` exist

## Workflow follow-up

- Archive the change with `/opsx-archive` after review when implementation is done.
- Next proposed changes: Nest modules / schema-migrations / api-http-contract (depend on this foundation).
