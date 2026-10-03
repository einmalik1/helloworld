# api

REST backend for persistence and domain API. Data via Postgres; files via S3. Auth via Better Auth (see [`spec/tech-stack.md`](../../spec/tech-stack.md)).

## Deploy

QA/Prod: Coolify Application. Image from multi-stage `apps/api/Dockerfile` (build context = monorepo root). Coolify builds from Git on deploy — see [`spec/tech-stack.md`](../../spec/tech-stack.md#coolify-build-deploy-data-services). Dockerfile not scaffolded yet.

## Local

**Prerequisites:** local Postgres and (for file features) S3 — root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- api ---`); do not add `apps/api/.env`.

Start from the repo root:

```bash
pnpm run dev
# or only this package:
pnpm run --filter api dev
```

## Generated Nest DTOs

`pnpm generate` / `pnpm generate:nest-dto` writes thin `createZodDto` wrappers:

```text
apps/api/src/{resource}/dto/
  create-{resource}.dto.ts
  update-{resource}.dto.ts
  {resource}-response.dto.ts
  index.ts
```

Schemas come from `@helloworld/types/api`. Do not hand-edit these files. App wiring still needs `nestjs-zod` when Nest is scaffolded.

ORM/schema details (Drizzle) will be documented here when packages land.
