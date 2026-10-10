# Spec Delta

## MODIFIED Requirements

### Requirement: Async import and export via worker
Import and export of catalog resources MUST run asynchronously on `apps/worker` under the `worker-jobs` model (v1: Nest `@nestjs/schedule` + Postgres-backed work state — not a mandatory Redis or pg-boss dependency). Starting an import or export via the API MUST return quickly with acceptance semantics (`202` intent) and run identifiers.

#### Scenario: Start import returns without waiting for file apply
- **WHEN** a client starts an import after uploading a file to object storage
- **THEN** the API responds with run/job identifiers without holding the HTTP request open until processing finishes
