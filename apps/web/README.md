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

Global inventory: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#web-appsweb). Search/graph boundaries: [`openspec/tech-stack.md` § Search / knowledge graph](../../openspec/tech-stack.md#search--knowledge-graph).

## Graph explorer (intent)

Interactive knowledge-graph view in the SPA. **Cytoscape.js** renders `{ nodes, edges }` from the api retrieve facade — never talks to Apache AGE or Typesense directly.

| Concern | Contract |
|---|---|
| Data source | Authenticated calls to `apps/api` (`/graph/related`, `/graph/subgraph`) |
| Payload | Product JSON only — map into Cytoscape elements in the web layer |
| Search UI | Optional: call `GET /search` for typeahead / hit lists, then open a subgraph |
| Forbidden | Embedding Typesense/AGE clients or engine URLs in the browser |

ADR: [`openspec/decisions/0006-search-knowledge-graph.md`](../../openspec/decisions/0006-search-knowledge-graph.md).

## Chat (minimal client)

Temporary static client: [`chat.html`](./chat.html) → `PUBLIC_CHAT_URL` / `http://localhost:3200` with `x-api-key`. The browser must **not** call LLM vendor URLs — [ADR 0008](../../openspec/decisions/0008-chat-service-app.md).

```bash
pnpm --filter @helloworld/chat dev
# open apps/web/chat.html (or any static server on :5173)
```

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

Scaffolding (Vite + shadcn + auth client) comes when the package is implemented.
