# storybook

Deployed UI component gallery (centrally reachable).

## Deploy

QA/Prod: Coolify Application. Multi-stage `apps/storybook/Dockerfile`; Coolify builds from Git — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services).

## Local

No Postgres/S3 required for component stories (unless a story hits live APIs). Optional keys in root `.env` (section `# --- storybook ---`); do not add `apps/storybook/.env`.

```bash
pnpm run --filter storybook dev
```

Framework and setup come later.
