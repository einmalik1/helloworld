# storybook

Deployed UI component gallery (centrally reachable).

## Local

No Postgres/S3 required for component stories (unless a story hits live APIs). Optional keys in root `.env` (section `# --- storybook ---`); do not add `apps/storybook/.env`.

```bash
pnpm run --filter storybook dev
```

Framework and setup come later.
