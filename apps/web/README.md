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
| Graph explorer | **Cytoscape.js** — viz over `GET /graph/related` / `GET /graph/subgraph` JSON only |
| Storybook | Sibling app uses `@storybook/react-vite` (same Vite line) |
| Logging | Web client rules (`console` / UI) — no Pino in the browser |
| Build | `vite build` → bundler out |

Global inventory: [`spec/tech-stack.md`](../../spec/tech-stack.md#web-appsweb). Search/graph boundaries: [`spec/tech-stack.md` § Search / knowledge graph](../../spec/tech-stack.md#search--knowledge-graph).

## Graph explorer (intent)

Interactive knowledge-graph view in the SPA. **Cytoscape.js** renders `{ nodes, edges }` from the api retrieve facade — never talks to Apache AGE or Typesense directly.

| Concern | Contract |
|---|---|
| Data source | Authenticated calls to `apps/api` (`/graph/related`, `/graph/subgraph`) |
| Payload | Product JSON only — map into Cytoscape elements in the web layer |
| Search UI | Optional: call `GET /search` for typeahead / hit lists, then open a subgraph |
| Forbidden | Embedding Typesense/AGE clients or engine URLs in the browser |

ADR: [`spec/decisions/0004-search-knowledge-graph.md`](../../spec/decisions/0004-search-knowledge-graph.md).

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
