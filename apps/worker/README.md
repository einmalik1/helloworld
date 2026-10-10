# worker

Background jobs and automation.

## Stack

- **Nest** standalone worker (same Nest major as API)
- **pg-boss** on PostgreSQL — [ADR 0005](../../openspec/decisions/0005-worker-pg-boss.md)
- OpenSpec: `worker-jobs` (impex jobs also `impex`)

Exposes `GET /health` (public) and operator job HTTP (list/status/retry) for CLI/TUI. Product impex UX prefers API run endpoints.

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/worker/Dockerfile` (monorepo-root build context); Coolify builds from Git — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites:** Postgres always; S3 when jobs touch object storage. Coolify **test** on the Coolify host. Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- worker ---`); do not add `apps/worker/.env`.

```bash
pnpm run --filter worker dev
```
