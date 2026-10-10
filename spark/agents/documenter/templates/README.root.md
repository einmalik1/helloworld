# helloworld

Template monorepo for React/TypeScript projects.

## What this is

Short overview (2–4 sentences). Details live in component READMEs and under `spark/`.

## Layout

| Path        | Role                                              |
| ----------- | ------------------------------------------------- |
| `apps/`     | Services (web, api, worker, docs, storybook, mcp) |
| `tools/`    | cli, tui                                          |
| `packages/` | Shared libraries                                  |
| `infra/`    | postgres, s3                                      |
| `tests/`    | System-wide tests                                 |
| `openspec/`     | Product specs (features, decisions, ERD)          |
| `spark/`    | Repo profile and agent roles                      |

## Components

Inventory tables for services, data, tooling, tests, spec, platform, shared — what exists before how to run it.

## Local development

Only **after** layout/components: from repo root — install → Postgres + S3 → `cp .env.example .env` (single file, sections by service) → `pnpm run dev` → quality gates. Root scripts + `pnpm run --filter <pkg> …`. Never per-app `.env`.
