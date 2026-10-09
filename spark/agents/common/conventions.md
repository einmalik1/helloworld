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

## New resource workflow

Canonical checklist when adding a domain resource (table → API → client). Process home for agents; Nest-focused mirror: [`apps/api/README.md` § Feature / new resource](../../../apps/api/README.md#feature--new-resource-workflow). Stack inventory pointers: [`spec/tech-stack.md` § Schema generators](../../../spec/tech-stack.md#schema-generators-sparkgenerators). Issue: [#13](https://github.com/einmalik1/helloworld/issues/13).

### Generated vs hand-written

| Kind | Artefacts |
|---|---|
| **Generated** | Entity / API Zod (`packages/types`), Nest `createZodDto` wrappers (`apps/api/.../dto/`), OpenAPI client (`packages/api-client` via Orval) |
| **Hand-written** | Drizzle query methods on `DatabaseService`, Nest feature controller/service/module, unit + `tests/api`, optional CLI/TUI surfaces |

Domain Drizzle **schema** TS comes from the `drizzle` generator stage (`schema.sql` → `packages/modules`); auth tables stay Better Auth owned — see [`tech-stack.md` § Database / Drizzle](../../../spec/tech-stack.md#database--drizzle-schema--migrations).

### Checklist (order + ownership)

| # | Step | Owner | Notes |
|---|---|---|---|
| 1 | Edit [`spec/erd/schema.sql`](../../../spec/erd/schema.sql) (+ `spark/repo-profile.yaml` generator categories if needed) | Human / agent | SQL is the domain SoT |
| 2 | `pnpm generate` | Anyone | core → types → api → nest_dto (+ drizzle stage) |
| 3 | Apply migrations (`pnpm db:migrate` intent — `drizzle-kit migrate`) | Anyone | Same script local + Coolify pre-deploy; **before** hand queries |
| 4 | `DatabaseService` domain methods | Hand | Queries only — no generic CRUD; schema already generated |
| 5 | Feature module (`controller` / `service` / `module`) + `AppModule` import | Hand | Use generated DTOs; neverthrow in the service |
| 6 | `openapi:export` → `pnpm generate:client` | Anyone | Nest OpenAPI → Orval client |
| 7 | Unit tests + `tests/api` | Hand | Match HTTP contract in the api README |
| 8 | Optional CLI command / TUI surface | Hand | Thin clients via `packages/api-client` |

Do **not** hand-edit generated Zod, Nest DTO, or Orval output. Do **not** put runtime DDL in Nest lifecycle.

## Env and process starts

- **One** env file: repo-root `.env` (from `.env.example`), sections sorted by service
- **Never** add `apps/*/.env`, `tools/*/.env`, or other per-package env files for app config
- Start services from the **repo root** (`pnpm run dev`, `pnpm run --filter <pkg> …`) so the root env is what processes see
- Root scripts (`dev`, `build`, `test`, `lint`, `typecheck`, `format`) are the default entry points once Turborepo is wired