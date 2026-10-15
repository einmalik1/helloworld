## Why

Coolify test already has Postgres and Garage, but `coolify.apps` is empty because no app Dockerfiles exist. Agents and CI cannot deploy or probe the app plane (`api` / `worker` / `mcp` / `web`) on Coolify test or production until multi-stage images and Application resources are wired.

## What Changes

- Add multi-stage Dockerfiles (monorepo-root build context) for `apps/api`, `apps/worker`, `apps/mcp`, and `apps/web` per the tech-stack Coolify stage contract.
- Create Coolify Applications (Dockerfile build pack, Git source) for **test** and **production**; wire runtime env from existing data-plane services (do not commit secrets).
- Configure pre-deploy / migrate for api (and worker as needed) via `pnpm db:migrate`.
- Update `spark/repo-profile.yaml` → `coolify.apps` with UUIDs, Dockerfile paths, FQDNs, and `/health` notes.
- Document blockers: stock Postgres (no AGE pin yet), Typesense not provisioned on Coolify, chat Application deferred (not in app plane).

## Capabilities

### New Capabilities

- `coolify-app-deploy`: App-plane Docker images and Coolify Application resources for test/production (Dockerfile contract, env wiring, health, profile recording).

### Modified Capabilities

- `coolify-test-env`: Extend profile/`apps[]` expectations once Dockerfiles unlock the app plane (no longer “placeholder skip only”).

## Impact

- New files: `apps/{api,worker,mcp,web}/Dockerfile`, root `.dockerignore`.
- Coolify mutations (context `home`): Application create/update/env for helloworld project envs `test` and `production`.
- Profile: `spark/repo-profile.yaml` `coolify.apps` and related comments.
- Does **not** wipe test Postgres/Garage, start host Compose on Coolify, or provision Typesense/AGE custom image in this change.
