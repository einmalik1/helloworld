# s3

Object storage for files (S3 API).

**Prod / QA:** [Garage](https://garagehq.deuxfleurs.fr/) as Coolify one-click service (S3-compatible) — see [`spec/tech-stack.md`](../../spec/tech-stack.md).

## Local

MinIO-compatible stand-in for the monorepo happy path (root [Local development](../../README.md#local-development)):

```bash
pnpm run docker:local:up          # intent — includes s3
# or:
docker compose up -d s3
```

**Compose (intent):** service `s3` in the root Compose file (or included from `infra/s3`). Credentials and bucket from root `.env` (`S3_*` section) — no `infra/s3/.env`.

Needed for uploads / object-storage features in `api` / `worker` / e2e. App code uses `@aws-sdk/client-s3`.