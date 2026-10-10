# Spec Delta

## MODIFIED Requirements

### Requirement: Channel persistence fields
A channel MUST have a UUID id, unique slug, name, and created_at timestamp, matching `openspec/data-model/schema.sql`.

#### Scenario: Duplicate slug rejected
- **WHEN** a client creates a channel with a slug that already exists
- **THEN** the operation fails with a conflict/validation outcome consistent with the API contract
