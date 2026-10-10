# domain-person Specification

## Purpose
Defines the Person domain resource: someone who authors greetings or reacts — persisted in Postgres and exposed through platform use-cases and the API.

## Requirements

### Requirement: Person persistence fields
A person MUST have a UUID id, non-empty display name, unique email, and created_at timestamp, matching `openspec/data-model/schema.sql`.

#### Scenario: Duplicate email rejected
- **WHEN** a client creates a person with an email that already exists
- **THEN** the operation fails with a conflict/validation outcome consistent with the API contract

### Requirement: Person CRUD via platform and API
The system MUST support create, read, list, update (PATCH), and delete for persons through `@helloworld/platform` and the HTTP API under the shared HTTP contract.

#### Scenario: Create then get by id
- **WHEN** a client creates a person and then GETs by id
- **THEN** the stored display_name and email match what was created
