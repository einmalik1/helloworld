## ADDED Requirements

### Requirement: Search and graph projection jobs

`apps/worker` MUST run Nest `@nestjs/schedule` jobs that (1) drain `search_sync_outbox` rows into AGE + Typesense mutations and (2) rebuild the full AGE graph and Typesense `helloworld` collection from Postgres domain tables. These jobs MUST share `DATABASE_URL` and root `TYPESENSE_*` with api; they MUST NOT require Redis or pg-boss in v1.

#### Scenario: Outbox drain applies pending mutations

- **WHEN** unprocessed outbox rows exist and the drain interval fires
- **THEN** the worker applies AGE and Typesense upserts/deletes and marks rows processed

#### Scenario: Schedule module boots with worker

- **WHEN** the worker process starts
- **THEN** `ScheduleModule` is registered and projection jobs are active without a separate queue broker
