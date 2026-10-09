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

## Git conventions

Repo-wide process for humans and agents. Stack inventory stays in [`spec/tech-stack.md`](../../../spec/tech-stack.md); do not duplicate these rules there. Per-app deltas (if any) belong in that component’s README.

### Branches

Use these prefixes:

| Prefix | Use |
|---|---|
| `feature/*` | New behaviour or capability |
| `fix/*` | Bug fixes |
| `chore/*` | Tooling, deps, process, non-feature maintenance |

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, and similar types. Keep the subject short and imperative.

### Pre-merge quality gate

Default bar before merge (from repo root, via Turbo when wired):

1. `pnpm run format`
2. `pnpm run lint`
3. `pnpm run typecheck`
4. **Smoke tests** (not the full suite)
5. `pnpm run build` where the change touches packages that emit (`dist/` / app outs)

The full test suite stays available for CI and deeper verification; it is **not** the default pre-merge gate. Optional lefthook/CI wiring can enforce this later.

## Env and process starts

- **One** env file: repo-root `.env` (from `.env.example`), sections sorted by service
- **Never** add `apps/*/.env`, `tools/*/.env`, or other per-package env files for app config
- Start services from the **repo root** (`pnpm run dev`, `pnpm run --filter <pkg> …`) so the root env is what processes see
- Root scripts (`dev`, `build`, `test`, `lint`, `typecheck`, `format`) are the default entry points once Turborepo is wired