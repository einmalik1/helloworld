## Context

Coolify project `rx35b6552e0csdcmqffv5ycv` (context `home`) already has environments `test` / `production` and test data plane (Postgres `uajgxibw9cp5bbk0ftpozngg`, Garage `wkcfjdulstfgbjcrmndvygup`). App plane blocked on Dockerfiles. Tech-stack contracts live in `openspec/tech-stack.md` § Coolify.

## Goals / Non-Goals

**Goals:**

- Ship Dockerfiles for api, worker, mcp, web.
- Create Coolify Applications on test + production; wire env; record UUIDs in profile.
- Enable `/health` probes; migrate path for api.

**Non-Goals:**

- Wipe/replace test Postgres or Garage.
- Host Compose on Coolify.
- Provision Typesense or AGE custom Postgres image (document blockers).
- Chat Coolify Application (not in app plane).
- New repository ADR (deploy shape already in tech-stack).

## Decisions

### 1. turbo prune + node:26-alpine

Follow tech-stack: prune per package name (`api`, `worker`, `mcp`, `@helloworld/web`), build with Turbo, runtime as `nodeapp` 1001.

### 2. Coolify dockerfile_location at app path, base `/`

Git public source `einmalik1/helloworld`, build pack `dockerfile`, `base_directory=/`, `dockerfile_location=/apps/<app>/Dockerfile` (set via Coolify API when CLI lacks the flag).

### 3. Migrate via api entrypoint

Api image includes drizzle migrations + `drizzle-kit` and runs `pnpm db:migrate` on start unless `SKIP_DB_MIGRATE=1`. Matches local `pnpm db:migrate` without relying on fragile host pre-deploy cwd.

### 4. Production apps now; prod data plane as follow-up if missing

Create production Applications in parallel with test. If production lacks Postgres/Garage, document blocker and still register apps (env placeholders) rather than inventing infra silently. Prefer creating production Postgres+Garage when CLI can, so `/health` can pass.

### 5. Web serves Vite `dist` with `serve`

Runtime uses `serve` on the built static output (keeps `node:26-alpine` contract).

## Risks / Trade-offs

- **[Risk] Stock Postgres lacks AGE** → Document; graph features degraded until image pin.
- **[Risk] Typesense missing** → Api health may warn/fail if health requires Typesense; document and set Typesense env to optional or stub until provisioned.
- **[Risk] turbo prune friction** → Fall back to filtered pnpm install copying lockfile + workspace packages.
- **[Risk] Same Docker network for DB** → Use Coolify destination `coolify` / internal DB URL host = database uuid.

## Migration Plan

1. Land Dockerfiles + `.dockerignore` on branch; push.
2. Create Coolify apps; PATCH dockerfile_location, health, env.
3. Deploy test first; verify `/health`; then production.
4. Update `spark/repo-profile.yaml`.

## Open Questions

- Production FQDN scheme (sslip.io vs home.mlk) — use Coolify auto FQDN unless operator domains exist.
