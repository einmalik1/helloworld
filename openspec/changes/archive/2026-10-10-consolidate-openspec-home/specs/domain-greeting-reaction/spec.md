# Spec Delta

## MODIFIED Requirements

### Requirement: Reaction persistence and uniqueness
A greeting reaction MUST have a UUID id, greeting_id, person_id, emoji text, and created_at, with uniqueness on (greeting_id, person_id, emoji), matching `openspec/data-model/schema.sql`.

#### Scenario: Duplicate reaction rejected
- **WHEN** the same person adds the same emoji to the same greeting twice
- **THEN** the second create fails due to the uniqueness constraint
