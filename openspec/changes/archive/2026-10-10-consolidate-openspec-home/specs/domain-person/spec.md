# Spec Delta

## MODIFIED Requirements

### Requirement: Person persistence fields
A person MUST have a UUID id, non-empty display name, unique email, and created_at timestamp, matching `openspec/data-model/schema.sql`.

#### Scenario: Duplicate email rejected
- **WHEN** a client creates a person with an email that already exists
- **THEN** the operation fails with a conflict/validation outcome consistent with the API contract
