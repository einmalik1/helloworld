# api

REST backend for persistence and domain API. Data via Postgres; files via S3. Auth via Better Auth (see [`spec/tech-stack.md`](../../spec/tech-stack.md)).

## Local

**Prerequisites:** local Postgres and (for file features) S3 — root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- api ---`); do not add `apps/api/.env`.

Start from the repo root:

```bash
pnpm run dev
# or only this package:
pnpm run --filter api dev
```

ORM/schema details (Drizzle) will be documented here when packages land.
