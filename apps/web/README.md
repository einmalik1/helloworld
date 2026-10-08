# web

React-based web frontend as its own HTTP service.

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/web/Dockerfile`; Coolify builds from Git — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services).

## Local

**Prerequisites for full flows:** a running `api` (Postgres; S3 when testing uploads). Infra + env: root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- web ---`); do not add `apps/web/.env`.

Start from the repo root:

```bash
pnpm run dev
# or only this package:
pnpm run --filter web dev
```

Stack: React 19 + **Vite** (port `5173`), shadcn/ui + Tailwind, driver.js tours; API via session cookies (+ optional Orval client) — [`spec/tech-stack.md`](../../spec/tech-stack.md#web-appsweb).
