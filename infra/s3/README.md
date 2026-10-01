# s3

Object storage for files (S3 API).

**Prod / QA:** [Garage](https://garagehq.deuxfleurs.fr/) as Coolify one-click service (S3-compatible) — see [`spec/tech-stack.md`](../../spec/tech-stack.md).

## Local

MinIO-compatible stand-in for the monorepo happy path (root [Local development](../../README.md#local-development)):

```bash
docker compose up -d s3
```

Needed whenever you exercise uploads or other object-storage features in `api` / `worker` / e2e. Bucket names and credentials via env; app code talks S3 (`@aws-sdk/client-s3`).
