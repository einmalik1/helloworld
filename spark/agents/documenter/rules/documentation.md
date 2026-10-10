# Documentation rules (Hello World)

## Scope

- Prefer updating existing docs over inventing new top-level files.
- Root `README.md` stays short (layout, components, pointers).
- Component details live in READMEs under `apps/`, `tools/`, `infra/`, `tests/`, `packages/`.
- Product specs live under `openspec/` (not under `apps/docs`).
- Write all documentation in English.

## Locations

- Root overview: `README.md`
- Domain glossary: `CONTEXT.md`
- Agent pointer: `AGENTS.md`
- Product specs: `openspec/` (`features/`, `decisions/`, `architecture.md`, `tech-stack.md`, `erd/`)
- Spark / agents / plans: `spark/`
- Published docs site: `apps/docs` (consumes `spec/`)
- App/package READMEs at each component path

## Spec vs docs app

| Layer | Path | Role |
|---|---|---|
| Source | `spec/` | Hand-authored product truth |
| Generated | `openspec/data-model/generated/` | From `pnpm generate` (`spark/generators/`; categories in `repo-profile.yaml`) |
| Publish | `apps/docs` | HTTP site serving / embedding `spec/` |

Do not rewrite plans under `spark/plans/` into `spec/` automatically — plans are process; specs are the durable contract.

## Root README order

1. What this repo/template is (short)
2. Layout + Components (inventory first)
3. Local development (happy path, scripts, environment) — only after the reader knows the pieces

Do not lead with scripts/env before the component inventory.

## Local development docs

| Layer | Owns |
|---|---|
| Root `README.md` | Happy path from repo root: install, Postgres + S3, **single root `.env`**, `pnpm run dev` / quality scripts, filter examples — placed **after** Components |
| Root `.env.example` | Template only; sections **sorted by service**; never commit `.env` |
| `infra/*/README.md` | How to start that data service locally vs Coolify in QA/Prod |
| `apps/*`, `tools/*` READMEs | Prerequisites + point to root scripts / `pnpm run --filter …` from root (no per-app env) |
| `tests/README.md` | Which suites need which services up |

Do not document only “start the API” — if the product has a web UI and object storage, the happy path must mention them (or explicitly mark optional).

**Hard rule:** do not instruct agents or humans to create `.env` under `apps/` or `tools/`.

## Style

- Factual and concise; use tables for inventories.
- Framework/stack versions live in `openspec/tech-stack.md` and component READMEs — root only points there.
- Document root script surface (`dev`, `build`, `test`, `lint`, `typecheck`, `format`) even before every package implements them.

## Out of scope

- Rewriting plans under `spark/plans/`
- Changing other agent role rules (except pure docs about how to use that kit)
- Inventing infrastructure secrets or Coolify UUIDs
- Hand-editing files under `openspec/data-model/generated/`
