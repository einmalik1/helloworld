# storybook

Deployed UI component gallery (centrally reachable).

## Deploy

Production only: Coolify Application at **`https://hw-story.home.mlk`**. Multi-stage `apps/storybook/Dockerfile`; Coolify builds from Git — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md#coolify-build-deploy-data-services). UUID/FQDN: `spark/repo-profile.yaml` → `coolify.apps` (`id: storybook`, `environment: production`).

## Local

No Postgres/S3 required for component stories (unless a story hits live APIs). Optional keys in root `.env` (section `# --- storybook ---`); do not add `apps/storybook/.env`.

```bash
pnpm run --filter @helloworld/storybook dev
pnpm run --filter @helloworld/storybook smoke
```

Framework: Storybook **10.6.1** + `@storybook/react-vite` (same Vite line as `apps/web`) — [`openspec/tech-stack.md`](../../openspec/tech-stack.md#web-appsweb).
