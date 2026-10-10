# Spec Delta

## MODIFIED Requirements

### Requirement: Greeting persistence and relations
A greeting MUST have a UUID id, author_id referencing person, channel_id referencing channel, message text, and created_at, matching `openspec/data-model/schema.sql`. Deleting a person MUST cascade to their greetings; deleting a channel that still has greetings MUST be restricted.

#### Scenario: Create greeting requires existing author and channel
- **WHEN** a client creates a greeting with unknown author_id or channel_id
- **THEN** the operation fails (foreign key / not found) rather than creating orphans
