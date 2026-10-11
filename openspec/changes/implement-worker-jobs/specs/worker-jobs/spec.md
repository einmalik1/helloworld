## ADDED Requirements

### Requirement: Nest worker process boots with schedule

`apps/worker` MUST be a NestJS 12 Express application that boots via `main.ts` / `AppModule`, validates env with a Zod `envSchema` through `createAppConfigModule`, imports `@helloworld/modules` in order config → Auth → Database → Health → logger, then `ScheduleModule.forRoot()` and job feature modules. The process MUST NOT load `apps/worker/.env`. Job triggers MUST use Nest `@nestjs/schedule` (cron/interval); pg-boss MUST NOT be a dependency.

#### Scenario: AppModule composes schedule and shared modules

- **WHEN** the worker process starts from the repo root with a valid root `.env`
- **THEN** Nest boots with shared modules plus `ScheduleModule` and without a pg-boss client or app-local env file

### Requirement: Operator job HTTP on the worker

`apps/worker` MUST expose authenticated operator endpoints to list jobs, fetch job status by id, and retry a failed job. `GET /health` MUST remain public. Job HTTP MUST NOT require OpenAPI/Orval on the worker in v1.

#### Scenario: Operator lists jobs with credentials

- **WHEN** an operator calls `GET /jobs` with a valid Better Auth session or `x-api-key`
- **THEN** the worker returns job rows including status fields from Postgres-backed work state

#### Scenario: Health stays public

- **WHEN** an unauthenticated client calls `GET /health`
- **THEN** the endpoint responds without requiring a session or API key

## MODIFIED Requirements

### Requirement: Durable jobs on Postgres queue

Long-running work (including impex and search/graph projection sync) MUST run as jobs owned by `apps/worker` without a Redis broker. For template v1 the job trigger model MUST be Nest **`@nestjs/schedule`** plus durable work state in **PostgreSQL** (job and/or outbox rows). A separate queue product (e.g. pg-boss) MUST NOT be required in v1. Job row state MUST be readable via the worker operator HTTP surface.

#### Scenario: Import does not need Redis

- **WHEN** an import job is enqueued or scheduled
- **THEN** job coordination does not require Redis

#### Scenario: Schedule is the v1 trigger

- **WHEN** an agent reads the worker-jobs capability after this change is archived
- **THEN** the normative trigger is `@nestjs/schedule` / Postgres-backed work state, not a mandatory pg-boss dependency

#### Scenario: Job rows persist in Postgres

- **WHEN** the worker accepts or schedules work that updates durable state
- **THEN** status is stored in PostgreSQL job/outbox tables shared with the SoT database
