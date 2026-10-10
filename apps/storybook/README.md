# storybook

Deployed UI component gallery (centrally reachable).

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/storybook/Dockerfile`; Coolify builds from Git — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md#coolify-build-deploy-data-services).

## Local

No Postgres/S3 required for component stories (unless a story hits live APIs). Optional keys in root `.env` (section `# --- storybook ---`); do not add `apps/storybook/.env`.

```bash
pnpm run --filter storybook dev
```

Framework: Storybook **10.6** + `@storybook/react-vite` (same Vite line as `apps/web`) — [`spec/tech-stack.md`](../../spec/tech-stack.md#web-appsweb).
