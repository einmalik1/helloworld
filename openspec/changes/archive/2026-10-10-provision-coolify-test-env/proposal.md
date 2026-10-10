# Proposal

## Why

Agents and CI need a shared Coolify **test** environment (Postgres, object storage, later search/graph, plus API/MCP) instead of starting Compose on the Coolify host. The Spark profile now declares that environment; what is missing is an agent-executable ticket to provision it with the Coolify CLI and write UUIDs/URLs back into `spark/repo-profile.yaml`.

## What Changes

- Specify how the Coolify **test** environment is provisioned (project/env, data services, app placeholders) via Coolify CLI.
- Define what must be recorded in `spark/repo-profile.yaml` after provisioning (`instance_url`, `project_uuid`, environment identifiers, service connection intents).
- Provide agent tasks so one agent can create/update the test plane without touching production/QA blindly.
- Document agents/CI consume test via API/MCP URLs — not direct engine sprawl from worktrees.

**Out of scope:** Full app Dockerfiles/deploy of every service; Search/Graph engine final pick (#16); production cutover; implementing Nest apps.

## Capabilities

### New Capabilities

- `coolify-test-env`: Provisioning and profile contract for the shared Coolify test environment used by agents and CI.

### Modified Capabilities

- (none required; spark profile already lists `test` — this change owns the provisioning behaviour)

## Impact

- **Touched:** `spark/repo-profile.yaml` (fill Coolify fields), optional agent rule under `spark/agents/`, docs pointers in `spark/README.md`.
- **Tooling:** Coolify CLI (`coolify` / documented commands) against the instance.
- **Risk:** Wrong context could affect QA/prod — tasks must target **test** slug only and confirm context before mutate.
