# worker

Background jobs and automation (queues, scheduled work).

## Local

**Prerequisites:** Postgres always; S3 when jobs touch object storage. Root [Local development](../../README.md#local-development). Config from the **root** `.env` only (section `# --- worker ---`); do not add `apps/worker/.env`.

```bash
pnpm run --filter worker dev
```

Stack and queue details come later.
