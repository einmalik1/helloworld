# web

React web frontend as its own HTTP service (Vite).

## Stack

| Piece | Choice |
|---|---|
| UI library | React **19.3** |
| Bundler | **Vite 8.3.4** (+ `@vitejs/plugin-react`) — dev port **`5173`** (`WEB_PORT` / `WEB_ORIGIN`) |
| UI kit | **shadcn/ui** on **Tailwind CSS 4.3.3** |
| Tours | driver.js **1.9.0** |
| API usage | Cookie session to Better Auth on `apps/api`; optional Orval `packages/api-client` — **not** `packages/terminal` |
| Storybook | Sibling app uses `@storybook/react-vite` (same Vite line) |
| Logging | Web client rules (`console` / UI) — no Pino in the browser |
| Build | `vite build` → bundler out |

Global inventory: [`spec/tech-stack.md`](../../spec/tech-stack.md#web-appsweb).

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

Scaffolding (Vite + shadcn + auth client) comes when the package is implemented.
