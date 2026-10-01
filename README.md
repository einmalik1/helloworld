# Hello World

Template monorepo for React/TypeScript projects. Keep this root README short; details live in each component README.

Stack inventory: [`spec/tech-stack.md`](spec/tech-stack.md). Per-app setup: READMEs under `apps/`, `tools/`, `infra/`.

## Layout

```text
apps/        # long-running services
tools/       # installable clients (CLI, TUI)
packages/    # shared libraries
infra/       # Postgres, S3, …
tests/       # system-wide tests
spec/        # product specs (features, decisions, ERD)
spark/       # repo profile, agent roles, Coolify QA/Prod
```

## Components

### Services (`apps/`)

| Component | Path | Role |
|---|---|---|
| **web** | `apps/web` | React web frontend |
| **api** | `apps/api` | REST backend for persistence and domain API |
| **worker** | `apps/worker` | Background jobs and automation |
| **docs** | `apps/docs` | HTTP documentation site (publishes `spec/`) |
| **storybook** | `apps/storybook` | Deployed UI component gallery |
| **mcp** | `apps/mcp` | MCP server for agent integration |

### Data (`infra/`)

| Component | Path | Role |
|---|---|---|
| **postgres** | `infra/postgres` | Relational persistence |
| **s3** | `infra/s3` | Object storage for files |

### Tooling (`tools/`)

| Component | Path | Role |
|---|---|---|
| **cli** | `tools/cli` | Installable CLI (`helloworld`); Commander + ky → `api` / `worker` |
| **tui** | `tools/tui` | Installable TUI (`helloworld-tui`); Ink + React + ky — separate from CLI |

### Tests (`tests/`)

System-wide tests (unit tests live next to code under `apps/` / `packages/` / `tools/`). See `tests/README.md`.

| Suite | Path | Focus |
|---|---|---|
| **e2e** | `tests/e2e` | Web UI including screenshots and HTML baselines |
| **api** | `tests/api` | REST interface |
| **mcp** | `tests/mcp` | MCP protocol and tools |
| **worker** | `tests/worker` | Jobs and side effects |
| **cli** | `tests/cli` | CLI against running services |
| **tui** | `tests/tui` | Terminal interaction |

### Spec (`spec/`)

Product specification — source of truth. Published by `apps/docs`.

| Path | Role |
|---|---|
| `features/` | Feature specs |
| `decisions/` | ADRs |
| `architecture.md` | System picture (tech-agnostic) |
| `tech-stack.md` | Technology stack |
| `erd/schema.sql` | Data model (hand-edit); run `pnpm erd:build` |

Domain glossary: root `CONTEXT.md`. Details: `spec/README.md`.

### Platform (`spark/`)

| Component | Path | Role |
|---|---|---|
| **spark** | `spark` | Repo profile, agent rules, automation |
| **coolify** | `spark/repo-profile.yaml` | QA and production deploy targets |
| **erd scripts** | `spark/scripts/erd` | SQL → diagrams / HTML viewer |

Key Spark paths: `spark/repo-profile.yaml`, `spark/agents/` (roles + `common/`), `spark/plans/`. Short pointer: root `agents.md`. Worktrees via Orca.

### Shared (`packages/`)

Shared libraries for apps and tools. Subpackages are added as needed.

## Local development

Always work from the **repo root**. One shared env file; start apps via root scripts (or root `pnpm --filter …`) so configuration resolves correctly.

```bash
# 1. Dependencies (all workspaces)
pnpm install

# 2. Local data services (Postgres + S3-compatible)
#    Compose files land under infra/ — until then, start whatever stand-ins you use.
docker compose up -d postgres s3

# 3. Env — single root file only (never apps/*/.env or tools/*/.env)
cp .env.example .env
#    Edit `.env`; keep sections sorted by service (see file headers).

# 4. Dev (from root — typical UI + API loop via Turborepo when wired)
pnpm run dev

# 5. Quality gates (from root, before commit)
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
```

### Scripts (root)

| Command | Role |
|---|---|
| `pnpm install` | Dependencies for all workspaces |
| `pnpm run dev` | Apps in watch mode (from root) |
| `pnpm run build` | Full monorepo build |
| `pnpm run test` | All tests |
| `pnpm run lint` | Oxlint across the workspace |
| `pnpm run typecheck` | `tsc --noEmit` across the workspace |
| `pnpm run format` | Oxfmt across the workspace |
| `pnpm run erd:build` | Regenerate ERD diagrams from `spec/erd/schema.sql` |

App-specific (still run from **repo root**):

```bash
pnpm run --filter api build
pnpm run --filter api test
pnpm add <pkg> --filter api
pnpm run --filter web dev
```

### Environment

| Rule | Detail |
|---|---|
| One file | Root `.env` only (template: `.env.example`) |
| Sorted by service | Sections for shared, Postgres, S3, `api`, `web`, `worker`, `mcp`, … |
| No per-app env | Do **not** place `.env` under `apps/` or `tools/` — that splits config and breaks root starts |
| Start from root | `pnpm run dev` / `pnpm run --filter <pkg> …` with cwd = repo root |

### What needs what

| Need | Where | Notes |
|---|---|---|
| Postgres | `infra/postgres` | Required by `api` / `worker` / Better Auth |
| Object storage (S3) | `infra/s3` | Required when exercising file uploads; local MinIO-compatible stand-in, Coolify Garage in QA/Prod |
| API | `apps/api` | REST + auth; needs Postgres (+ S3 for file features) |
| Web | `apps/web` | Frontend; needs a running `api` for full flows |
| E2E | `tests/e2e` | Needs `web` + `api` (+ infra) up — see `tests/README.md` |

Other surfaces (`worker`, `mcp`, `docs`, `storybook`, `cli`, `tui`) are optional for the basic UI loop — see each component README.
