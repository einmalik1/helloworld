# Tasks

## 1. CLI readiness and safety

- [x] 1.1 Verify Coolify CLI is installed and authenticated (`coolify --version` / status); record version in a short note under `spark/` or profile comment
- [x] 1.2 Confirm target is **test** only: read `spark/repo-profile.yaml` `coolify.environments`; refuse to proceed if the operator asked for production in this ticket — verify the working notes state slug `test`

## 2. Project and environment

- [x] 2.1 Set or confirm `coolify.instance_url` (and context/team as required by CLI); verify the field is non-empty in `spark/repo-profile.yaml`
- [x] 2.2 Create or select the Coolify project for helloworld; write `coolify.project_uuid`; verify UUID present in profile
- [x] 2.3 Ensure Coolify environment slug `test` exists in that project; verify CLI listing shows `test`

## 3. Data plane (test)

- [x] 3.1 Provision Postgres for **test** (Coolify database resource); record how agents obtain `DATABASE_URL` (profile comment or env mapping doc); verify a connection string or Coolify resource UUID is documented in the profile
- [x] 3.2 Provision S3-compatible storage for **test** (Garage preferred per tech-stack); record `S3_*` mapping; verify documentation exists in profile or infra README pointing at test
- [x] 3.3 (Optional if engines undecided) Leave search/graph as TODO comments under `data_plane` — verify profile still lists them as later

## 4. App plane placeholders

- [x] 4.1 If `apps/api` Dockerfile exists, create Coolify application for test linked to repo Dockerfile pack; otherwise document blocker and skip — verify either app UUID in profile `apps[]` or an explicit skip note
- [x] 4.2 Same for `worker` and `mcp` when Dockerfiles exist — verify profile or skip notes

## 5. Agent handoff

- [x] 5.1 Update `spark/README.md` / agent common note with: how to read test URLs from profile; do not run `docker:local:up` on Coolify host — verify the text is present
- [x] 5.2 Smoke: from an agent worktree, show that required test anchors (instance_url, project_uuid, test env) are readable without Compose — verify `grep`/`yq` against profile succeeds

## Workflow follow-up

- Archive after successful provision and review.
- Later: wire apps deploy + search/graph services once #16 and Dockerfiles land.
