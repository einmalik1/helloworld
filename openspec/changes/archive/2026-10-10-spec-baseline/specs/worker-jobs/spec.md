# Spec Delta

## Purpose

Defines background job execution for Hello World: durable jobs on PostgreSQL (pg-boss), worker process responsibilities, and operator-facing job HTTP distinct from the product API.

## ADDED Requirements

### Requirement: Durable jobs on Postgres queue
Long-running work (including impex) MUST run as durable jobs backed by PostgreSQL (pg-boss). Redis MUST NOT be required for the template job queue.

#### Scenario: Import does not need Redis
- **WHEN** an import job is enqueued
- **THEN** job durability is provided via PostgreSQL/pg-boss without a Redis dependency

### Requirement: Worker owns job execution
`apps/worker` MUST execute queued jobs and update terminal job/run state. The API MUST NOT keep HTTP requests open until large import/export file processing completes.

#### Scenario: API returns quickly when starting work
- **WHEN** a client starts an import or export via the API
- **THEN** the API responds with acceptance (`202` intent) while the worker performs the heavy work

### Requirement: Worker health and job operator HTTP
The worker MUST expose `GET /health` publicly and operator-oriented job endpoints to list/status/retry jobs for CLI/TUI operations.

#### Scenario: Operator lists jobs
- **WHEN** an operator calls the worker job list endpoint with appropriate credentials
- **THEN** impex and other jobs are visible with status information
