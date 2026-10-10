# Spec Delta

## Purpose

Defines the generic import/export capability: bulk load and extract of domain resources via object storage and worker jobs, started through the API with observable run status.

## ADDED Requirements

### Requirement: Async import and export via worker
Import and export of catalog resources MUST run asynchronously on the worker. Starting an import or export via the API MUST return quickly with acceptance semantics (`202` intent) and run identifiers.

#### Scenario: Start import returns without waiting for file apply
- **WHEN** a client starts an import after uploading a file to object storage
- **THEN** the API responds with run/job identifiers without holding the HTTP request open until processing finishes

### Requirement: Files live in object storage
Import payloads MUST be read from object storage by the worker. Export artifacts MUST be written to object storage by the worker and downloaded through the API (presigned or authenticated), not as unbounded sync streams from the worker to browsers by default.

#### Scenario: Worker reads import object
- **WHEN** an import job runs
- **THEN** the worker loads the object from S3-compatible storage rather than relying on API process memory for the whole file

### Requirement: Run status observable until terminal state
Clients MUST be able to observe impex run/job status until a terminal state (`succeeded`, `failed`, or `cancelled` if supported).

#### Scenario: Client polls run status
- **WHEN** a client has a `runId` from starting an export
- **THEN** it can GET run status until a terminal state is reached

### Requirement: Applies to Hello World catalog resources by default
Impex MUST apply by default to domain resources backed by `schema.sql` tables that expose normal CRUD (`person`, `channel`, `greeting`, `greeting_reaction`) unless a feature explicitly opts out. At least one resource MUST be exercisable end-to-end in the template spike.

#### Scenario: Unauthorized cannot start impex
- **WHEN** an unauthenticated caller attempts to start an import or download an artifact
- **THEN** the request is rejected
