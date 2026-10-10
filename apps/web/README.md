# web

React-based web frontend as its own HTTP service.

**Bundler:** **Vite** (dev port `5173` per `.env.example`). Talks to the API via `@helloworld/api-client` (sessions / Better Auth) — not `@helloworld/platform`.

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/web/Dockerfile`; Coolify builds from Git — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites for full flows:** a running `api` (Postgres; S3 when testing uploads). Infra + env: root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- web ---`); do not add `apps/web/.env`.

Start from the repo root:

```bash
pnpm run dev
# or only this package:
pnpm run --filter web dev
```

Stack and bundler details come later — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md).
