# coolify-app-deploy Specification

## Purpose

Defines how Hello World long-running apps are packaged as Coolify-built Docker images and registered as Coolify Applications for **test** and **production**.

## Requirements

### Requirement: Multi-stage Dockerfile per app plane service

Each of `apps/api`, `apps/worker`, `apps/mcp`, and `apps/web` MUST ship a multi-stage `Dockerfile` at that path. Build context MUST be the monorepo root. Images MUST follow the tech-stack stage contract: `turbo prune --docker` (or documented equivalent), `node:26-alpine` bases, non-root `nodeapp` UID/GID `1001`, and runtime CMD that runs built artefacts only.

#### Scenario: Api Dockerfile present

- **WHEN** an agent lists `apps/api/Dockerfile`
- **THEN** the file exists and documents monorepo-root context suitable for Coolify Dockerfile build pack

#### Scenario: Worker mcp web Dockerfiles present

- **WHEN** an agent lists Dockerfiles under `apps/worker`, `apps/mcp`, and `apps/web`
- **THEN** each path exists and follows the same stage contract (web uses Vite emit rather than Nest `dist/main.js`)

### Requirement: Coolify Applications for test and production

The helloworld Coolify project MUST have Application resources for `api`, `worker`, `mcp`, and `web` in environments **test** and **production**, using Git source + Dockerfile build pack with `dockerfile_location` pointing at the app Dockerfile and base directory at repo root.

#### Scenario: Profile lists app UUIDs

- **WHEN** provisioning completes
- **THEN** `spark/repo-profile.yaml` `coolify.apps` lists each app with uuid, environment slug, dockerfile path, and ports/health path

### Requirement: Runtime env wired without committing secrets

Applications MUST receive `DATABASE_URL`, `S3_*`, auth secrets, and public URL env vars from Coolify env / existing services. Secret values MUST NOT be committed to git.

#### Scenario: Profile documents mapping only

- **WHEN** an agent reads the Coolify section of `spark/repo-profile.yaml`
- **THEN** it documents how to resolve secrets via Coolify CLI and which env keys apps expect, without embedding secret material

### Requirement: Migrate before api serves traffic

Api (and worker when it depends on schema) MUST run `pnpm db:migrate` (or equivalent documented Coolify pre-deploy / entrypoint) before accepting traffic on a fresh deploy that needs schema.

#### Scenario: Pre-deploy migrate documented

- **WHEN** Coolify api Application is configured
- **THEN** pre-deploy or image entrypoint is set to apply Drizzle migrations using root `drizzle.config.ts` / `packages/modules/drizzle`

### Requirement: Health probe on /health

Coolify HTTP health checks for api, worker, and mcp MUST use path `/health`. Web MAY use `/` or a documented static health path.

#### Scenario: Api health path

- **WHEN** Coolify health check is enabled for api
- **THEN** `health_check_path` is `/health`

### Requirement: Infra blockers called out

Until AGE-enabled Postgres and Typesense are provisioned on Coolify, the profile or change notes MUST state those as blockers rather than inventing services. Chat Application MUST remain deferred while chat is not in the Coolify app plane.

#### Scenario: AGE and Typesense deferred

- **WHEN** an agent reads Coolify app-plane notes after this change
- **THEN** stock Postgres (no AGE pin) and missing Typesense are explicitly recorded as follow-ups
