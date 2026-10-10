# Spec Delta

## Purpose

Defines S3-compatible object storage for Hello World files: Coolify Garage (or equivalent) in deployed environments, local MinIO-compatible stand-in on laptops, accessed via platform adapters — not from web/CLI directly.

## ADDED Requirements

### Requirement: S3-compatible API for app files
Application file storage MUST use an S3-compatible API. Coolify/QA/Prod SHOULD use Garage; local laptop Compose MAY use MinIO as a stand-in.

#### Scenario: Env keys are S3-shaped
- **WHEN** an app needs object storage configuration
- **THEN** it uses the root `.env` `S3_*` keys documented in `.env.example`

### Requirement: Access through platform or Nest apps
Object storage SDKs MUST be used from `@helloworld/platform` adapters or Nest apps that own uploads — not from `tools/cli` / `tools/tui` / `apps/web` talking to S3 endpoints directly for product flows.

#### Scenario: CLI downloads via API
- **WHEN** a CLI user downloads an export artifact
- **THEN** the client calls the product API (api-client), which authorizes and provides download access, rather than embedding Garage credentials in the CLI

### Requirement: Coolify test plane includes object storage
The Coolify **test** environment MUST provide an S3-compatible service for agent/CI integration (recorded in `spark/repo-profile.yaml`).

#### Scenario: Profile records garage or equivalent
- **WHEN** agents look up test object storage
- **THEN** `spark/repo-profile.yaml` documents the test storage resource identifier
