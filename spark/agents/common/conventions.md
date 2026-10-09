# Project conventions (all agents)

- Monorepo layout and components: root `README.md`
- Agent roles: `spark/agents/`
- Repo profile (packages, Coolify): `spark/repo-profile.yaml`
- Worktrees and development flow: Orca
- Keep the root README short; put details in component READMEs
- All project documentation is written in English

## Architecture Decision Records

- ADR process (when required, naming, template, inventory vs “why”): [`spec/decisions/README.md`](../../../spec/decisions/README.md)
- New ADRs: `spec/decisions/NNNN-short-title.md` — contested product choices only, not every `tech-stack.md` version bump
- `tech-stack.md` stays factual; rationale and rejected alternatives live in ADRs

## Env and process starts

- **One** env file: repo-root `.env` (from `.env.example`), sections sorted by service
- **Never** add `apps/*/.env`, `tools/*/.env`, or other per-package env files for app config
- Start services from the **repo root** (`pnpm run dev`, `pnpm run --filter <pkg> …`) so the root env is what processes see
- Root scripts (`dev`, `build`, `test`, `lint`, `typecheck`, `format`) are the default entry points once Turborepo is wired