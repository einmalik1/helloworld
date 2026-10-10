# Spec Delta

## MODIFIED Requirements

### Requirement: Profile records connection anchors after provision
After a successful provision, `spark/repo-profile.yaml` MUST be updated with the Coolify instance URL, project UUID, and enough identifiers for agents to locate the test environment and its data-plane services: **Postgres** (AGE-capable image pin when graph is enabled), **object storage**, and — when search is in the test plane — **Typesense** identifiers or documented deferral.

#### Scenario: Empty placeholders filled
- **WHEN** provisioning completes successfully
- **THEN** `coolify.instance_url` and `coolify.project_uuid` are non-empty (or documented equivalents) and the test environment entry references provisioned Postgres and object storage at minimum

#### Scenario: Typesense documented for test
- **WHEN** search/knowledge-graph is expected on the Coolify test plane
- **THEN** the profile or linked ops notes record how Typesense is reached (UUID/URL/env) or explicitly state it is not yet provisioned
