# coolify-test-env Specification

## Purpose
Defines how the shared Coolify test environment is provisioned and recorded so agents and CI integrate against a stable plane without host Compose.

## Requirements

### Requirement: Test environment declared in Spark profile
`spark/repo-profile.yaml` MUST declare a Coolify environment with slug `test` as the agent/CI integration plane, distinct from `qa` and `production`.

#### Scenario: Profile lists test
- **WHEN** an agent reads `coolify.environments` in `spark/repo-profile.yaml`
- **THEN** an entry with `slug: test` is present alongside qa and production

### Requirement: Provision via Coolify CLI targets test only
Provisioning automation and agent tasks MUST create or update resources for the **test** environment only unless the operator explicitly overrides. They MUST NOT modify production as part of the default test-provisioning ticket.

#### Scenario: Default ticket scope is test
- **WHEN** an agent executes the provision-coolify-test-env task list
- **THEN** all Coolify CLI mutations are scoped to the test environment (or project resources solely for test)

### Requirement: Profile records connection anchors after provision
After a successful provision, `spark/repo-profile.yaml` MUST be updated with the Coolify instance URL, project UUID, and enough identifiers for agents to locate the test environment and its data-plane services: **Postgres** (AGE-capable image pin when graph is enabled), **object storage**, and — when search is in the test plane — **Typesense** identifiers or documented deferral.

#### Scenario: Empty placeholders filled
- **WHEN** provisioning completes successfully
- **THEN** `coolify.instance_url` and `coolify.project_uuid` are non-empty (or documented equivalents) and the test environment entry references provisioned Postgres and object storage at minimum

#### Scenario: Typesense documented for test
- **WHEN** search/knowledge-graph is expected on the Coolify test plane
- **THEN** the profile or linked ops notes record how Typesense is reached (UUID/URL/env) or explicitly state it is not yet provisioned

### Requirement: Agents use API/MCP against test, not host Compose
Documentation for the test plane MUST state that agents on the Coolify host use the test environment’s application endpoints (API and MCP) and MUST NOT run `pnpm run docker:local:up` on that host for integration.

#### Scenario: Spark README states agent rule
- **WHEN** a developer reads `spark/README.md` coolify/test guidance
- **THEN** it states agents/CI use the Coolify test environment rather than host Compose
