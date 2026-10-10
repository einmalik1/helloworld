# Spec Delta

## MODIFIED Requirements

### Requirement: Durable jobs on Postgres queue
Long-running work (including impex and search/graph projection sync) MUST run as jobs owned by `apps/worker` without a Redis broker. For template v1 the job trigger model MUST be Nest **`@nestjs/schedule`** plus durable work state in **PostgreSQL** (e.g. outbox / job rows). A separate queue product (e.g. pg-boss) MUST NOT be required in v1.

#### Scenario: Import does not need Redis
- **WHEN** an import job is enqueued or scheduled
- **THEN** job coordination does not require Redis

#### Scenario: Schedule is the v1 trigger
- **WHEN** an agent reads the worker-jobs capability after this change is archived
- **THEN** the normative trigger is `@nestjs/schedule` / Postgres-backed work state, not a mandatory pg-boss dependency

### Requirement: Worker owns job execution
`apps/worker` MUST execute jobs and update terminal job/run state. The API MUST NOT keep HTTP requests open until large import/export file processing or index projection completes.

#### Scenario: API returns quickly when starting work
- **WHEN** a client starts an import or export via the API
- **THEN** the API responds with acceptance (`202` intent) while the worker performs the heavy work

### Requirement: Worker health and job operator HTTP
The worker MUST expose `GET /health` publicly and operator-oriented job endpoints to list/status/retry jobs for CLI/TUI operations.

#### Scenario: Operator lists jobs
- **WHEN** an operator calls the worker job list endpoint with appropriate credentials
- **THEN** impex and other jobs are visible with status information
