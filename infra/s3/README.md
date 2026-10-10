# s3

Object storage for files (S3 API).

**Prod / QA:** [Garage](https://garagehq.deuxfleurs.fr/) as Coolify one-click service (S3-compatible) — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md).

## Local (laptops)

MinIO stand-in for the monorepo happy path (root [Local development](../../README.md#local-development)):

```bash
pnpm run docker:local:up          # includes s3 (MinIO on :9000)
# or only this service:
docker compose -f infra/docker-compose.yml up -d s3
```

**Compose:** service `s3` in [`infra/docker-compose.yml`](../docker-compose.yml). Credentials and bucket from root `.env` (`S3_*` section) — no `infra/s3/.env`. Create the `helloworld` bucket once after first start if apps require it.

**Agents / CI on the Coolify host:** do **not** run Compose here. Use Coolify **test** (Garage or equivalent) from [`spark/repo-profile.yaml`](../../spark/repo-profile.yaml); configure `S3_*` from that environment.

Needed for uploads / object-storage features in `api` / `worker` / e2e. App code uses `@aws-sdk/client-s3`.
