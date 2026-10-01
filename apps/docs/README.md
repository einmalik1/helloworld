# docs

HTTP documentation site. Publishes content from root `spec/` (features, decisions, architecture, tech-stack, ERD viewer).

Do not author durable product specs here — edit `spec/` instead.

## Local

No Postgres/S3 required for authoring or a static docs preview. Optional keys in root `.env` (section `# --- docs ---`); do not add `apps/docs/.env`.

```bash
pnpm run --filter docs dev
```

Framework and static wiring come later.
