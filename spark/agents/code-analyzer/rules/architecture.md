# Architecture (code-analyzer)

Cross-app boundaries for Hello World:

- `apps/` — long-running services (`web`, `api`, `worker`, `docs`, `storybook`, `mcp`)
- `tools/` — clients (`cli`, `tui`)
- `packages/` — shared libraries
- `infra/` — Postgres, S3
- `tests/` — system-wide suites

Clients and tests depend on running services; infra is runtime. Schema/ORM lives in packages or `api`.
