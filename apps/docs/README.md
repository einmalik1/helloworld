# docs

HTTP documentation site. Publishes content from root `openspec/` (features, decisions, architecture, tech-stack, ERD viewer).

Do not author durable product specs here — edit `openspec/` instead.

## Stack

| Piece         | Choice                                                    |
| ------------- | --------------------------------------------------------- |
| Docs UI / MDX | Fumadocs (`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`) |
| Host          | **Next.js** (App Router) — `next` **16.3.8**              |
| Content       | `openspec/` (read-only from this app’s perspective)           |

Inventory: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#docs-site-appsdocs).

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/docs/Dockerfile` (Next.js build); Coolify builds from Git — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md#coolify-build-deploy-data-services).

## Local

No Postgres/S3 required for authoring or a docs preview. Optional keys in root `.env` (section `# --- docs ---`); do not add `apps/docs/.env`.

```bash
pnpm run --filter docs dev
```

Scaffolding (Fumadocs + Next wiring) comes when the package is implemented.
