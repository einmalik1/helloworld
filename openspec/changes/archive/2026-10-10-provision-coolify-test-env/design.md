# Design

## Context

See `proposal.md`. Spark profile already lists `test` / `qa` / `production` with data_plane/app_plane intent on `test`. Coolify fields (`instance_url`, `project_uuid`, …) are still empty. Agents lack Docker socket rights and must not fight Coolify host ports.

## Goals / Non-Goals

**Goals:**

- Agent-runbook (tasks) to provision Coolify **test** via CLI and write IDs into the profile.
- Clear safety rail: test-only by default.
- Minimal data plane: Postgres + S3-compatible (Garage) first; search/graph later.

**Non-Goals:**

- Implementing application images beyond placeholders if Dockerfiles are not ready.
- Choosing search/graph engines (#16).
- Automating production.

## Decisions

### 1. Coolify CLI as the mutation tool

- Agent uses documented `coolify` CLI (version/auth via env or `coolify` login already on the machine).
- Exact subcommands vary by CLI version — tasks require `coolify --help` / resource create docs lookup at apply time rather than hard-coding fragile flags here.

### 2. Profile is source of truth for agents

- After provision, UUIDs and URLs live in `spark/repo-profile.yaml` so subsequent agents do not rediscover by scraping the UI.

### 3. Order of provision

1. Ensure Coolify context / auth  
2. Ensure project exists → write `project_uuid`  
3. Ensure environment `test`  
4. Create Postgres + Garage (or S3-compatible) for test  
5. Record connection intent (env var names already in `.env.example`)  
6. App services when Dockerfiles exist (api, worker, mcp) — may be deferred checkboxes if images missing  

### 4. Safety

- Explicit confirmation step in tasks when `instance_url` first set.
- Refuse to run destructive commands against `production` slug in this change’s task list.

## Risks / Trade-offs

- **[Risk] CLI UX differs across Coolify versions** → Mitigation: tasks start with version discovery; document commands actually used in profile comments.
- **[Risk] Partial provision leaves empty apps** → Mitigation: data plane first is enough for early integration; apps optional until Dockerfiles land.

## Open Questions

- Concrete Coolify instance URL / team for this deployment — operator fills at apply time (cannot invent).
