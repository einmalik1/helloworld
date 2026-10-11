## ADDED Requirements

### Requirement: API starts impex runs with 202 acceptance
The API MUST expose authenticated endpoints to start import and export for a named resource, returning HTTP `202` with run (and job) identifiers without waiting for worker completion. Unauthenticated callers MUST be rejected.

#### Scenario: Start person export returns quickly
- **WHEN** an authenticated client `POST /impex/person/exports` with a supported format
- **THEN** the API responds `202` with a `runId` (and associated job id) without holding the request open until the export file is written

#### Scenario: Unauthenticated start is rejected
- **WHEN** an unauthenticated caller attempts `POST /impex/person/imports` or `POST /impex/person/exports`
- **THEN** the request is rejected (401)

### Requirement: Upload and download via API and object storage
Import payloads MUST be accepted through an authenticated API upload that stores the object in S3-compatible storage and returns an object key. Export artifacts MUST be written to object storage by the worker and downloaded through an authenticated API download endpoint. The worker MUST NOT serve unbounded browser download streams as the default product path.

#### Scenario: Upload returns object key
- **WHEN** an authenticated client `POST /impex/uploads` with a file body
- **THEN** the API stores the object and returns an object key usable for a subsequent import start

#### Scenario: Download export after success
- **WHEN** a run has status `succeeded` and an export object key
- **THEN** an authenticated client can `GET /impex/runs/{runId}/download` and receive the artifact (or an authenticated redirect equivalent)

### Requirement: Worker executes impex jobs against object storage
`apps/worker` MUST claim queued impex jobs via Nest `@nestjs/schedule`, load import objects from object storage (or write export objects there), apply domain writes for supported resources, and update both `job` and `impex_run` terminal state.

#### Scenario: Worker processes queued impex job
- **WHEN** a queued impex job exists for a supported resource and format
- **THEN** the worker claims it, performs storage I/O and domain apply/export, and sets run and job to a terminal state

### Requirement: Person JSON end-to-end spike
At least the `person` resource MUST support JSON import and export end-to-end in the template. Import rows MUST validate with person Zod shapes; upsert MUST use the unique `email` key. Other catalog resources MAY return a clear unsupported error until wired the same way.

#### Scenario: Person JSON import upserts by email
- **WHEN** a JSON import job for `person` completes successfully
- **THEN** rows are applied using email as the upsert key and the run reaches `succeeded` (or `failed` if any row error, per template partial-failure default)

## MODIFIED Requirements

### Requirement: Run status observable until terminal state
Clients MUST be able to observe impex run/job status until a terminal state (`succeeded`, `failed`, or `cancelled` if supported). The API MUST expose `GET /impex/runs/{runId}` and `GET /impex/runs` for product-facing polling.

#### Scenario: Client polls run status
- **WHEN** a client has a `runId` from starting an export
- **THEN** it can GET run status until a terminal state is reached
