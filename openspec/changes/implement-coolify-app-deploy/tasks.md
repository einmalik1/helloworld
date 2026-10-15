# Tasks

## 1. Dockerfiles

- [x] 1.1 Add root `.dockerignore` suitable for turbo prune builds
- [x] 1.2 Add `apps/api/Dockerfile` (prune `api`, migrate entrypoint, `node dist/main.js`, port 3000)
- [x] 1.3 Add `apps/worker/Dockerfile` (prune `worker`, port 3001)
- [x] 1.4 Add `apps/mcp/Dockerfile` (prune `mcp`, port 3100)
- [x] 1.5 Add `apps/web/Dockerfile` (prune `@helloworld/web`, Vite build, static serve, port 5173)

## 2. Coolify Applications

- [x] 2.1 Create test Applications for api/worker/mcp/web (Git + dockerfile pack); set `dockerfile_location`, health `/health` (web `/`), ports
- [x] 2.2 Create production Applications for the same four apps
- [x] 2.3 Wire env from test Postgres/Garage (and prod data plane if created); do not commit secrets
- [x] 2.4 Deploy test apps; verify `/health` where reachable; note AGE/Typesense blockers

## 3. Profile + verify

- [x] 3.1 Update `spark/repo-profile.yaml` `coolify.apps` with UUIDs, paths, FQDNs, health notes
- [x] 3.2 Run package smoke gate (api/worker/mcp/web smoke or documented root gate)
- [x] 3.3 Mark OpenSpec tasks complete; commit and push branch
