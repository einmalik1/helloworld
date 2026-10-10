# Spec Delta

## Purpose

Defines Greeting Reaction: an emoji reaction from a person on a greeting, unique per (greeting, person, emoji).

## ADDED Requirements

### Requirement: Reaction persistence and uniqueness
A greeting reaction MUST have a UUID id, greeting_id, person_id, emoji text, and created_at, with uniqueness on (greeting_id, person_id, emoji), matching `spec/erd/schema.sql`.

#### Scenario: Duplicate reaction rejected
- **WHEN** the same person adds the same emoji to the same greeting twice
- **THEN** the second create fails due to the uniqueness constraint

### Requirement: Reaction CRUD via platform and API
The system MUST support create, read, list, update (PATCH), and delete for greeting reactions through `@helloworld/platform` and the HTTP API under the shared HTTP contract.

#### Scenario: Deleting greeting removes reactions
- **WHEN** a greeting is deleted
- **THEN** its reactions are removed (cascade) and no longer listed
