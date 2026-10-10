# domain-greeting Specification

## Purpose
Defines the Greeting domain resource: a hello message posted by a person on a channel, with referential integrity to author and channel.

## Requirements

### Requirement: Greeting persistence and relations
A greeting MUST have a UUID id, author_id referencing person, channel_id referencing channel, message text, and created_at, matching `openspec/data-model/schema.sql`. Deleting a person MUST cascade to their greetings; deleting a channel that still has greetings MUST be restricted.

#### Scenario: Create greeting requires existing author and channel
- **WHEN** a client creates a greeting with unknown author_id or channel_id
- **THEN** the operation fails (foreign key / not found) rather than creating orphans

### Requirement: Greeting CRUD via platform and API
The system MUST support create, read, list, update (PATCH), and delete for greetings through `@helloworld/platform` and the HTTP API under the shared HTTP contract.

#### Scenario: List can filter by channel
- **WHEN** greetings exist on multiple channels
- **THEN** list supports selecting greetings for a given channel (query or equivalent documented filter)
