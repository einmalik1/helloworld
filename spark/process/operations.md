# Operations

Coolify and runtime environments.

- Profile SoT: [`../repo-profile.yaml`](../repo-profile.yaml) (`coolify.environments`).
- **test**: shared agent/CI plane (Postgres, Garage/object storage; later API/MCP URLs).
- **qa** / **production**: application deploys; do not mutate from default test-provisioning work.
- Local laptop Compose (`pnpm run docker:local:*`) is for developer machines — not for agents on the Coolify host.

See also [`../README.md`](../README.md).
