# Operations

Coolify and runtime environments.

- Profile SoT: [`../repo-profile.yaml`](../repo-profile.yaml) (`coolify.environments`).
- **test**: shared agent/CI plane — Postgres (AGE-capable image when graph is enabled), Garage/object storage, **Typesense** when search is on the test plane; later API/MCP/chat URLs.
- **qa** / **production**: application deploys; do not mutate from default test-provisioning work.
- Local laptop Compose (`pnpm run docker:local:*`) is for developer machines — not for agents on the Coolify host. Local data plane intent: Postgres, **Typesense** (`infra/typesense`), S3-compatible storage — see root `.env.example` (`TYPESENSE_*`).

See also [`../README.md`](../README.md), [`../../infra/typesense/README.md`](../../infra/typesense/README.md).
