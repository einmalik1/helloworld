# Spec Delta

## Purpose

Defines the Channel domain resource: a surface where greetings are published (web, cli, …), with stable slug and human-readable name.

## ADDED Requirements

### Requirement: Channel persistence fields
A channel MUST have a UUID id, unique slug, name, and created_at timestamp, matching `spec/erd/schema.sql`.

#### Scenario: Duplicate slug rejected
- **WHEN** a client creates a channel with a slug that already exists
- **THEN** the operation fails with a conflict/validation outcome consistent with the API contract

### Requirement: Channel CRUD via platform and API
The system MUST support create, read, list, update (PATCH), and delete for channels through `@helloworld/platform` and the HTTP API under the shared HTTP contract.

#### Scenario: List includes created channel
- **WHEN** a client creates a channel and then lists channels
- **THEN** the new channel appears in the list results
