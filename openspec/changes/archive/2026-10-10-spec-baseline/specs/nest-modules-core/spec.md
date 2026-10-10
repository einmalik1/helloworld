# Spec Delta

## Purpose

Defines the shared Nest infrastructure package surface used by Nest apps: config, database, health, auth, and OpenAPI setup, with domain use-cases living in `@helloworld/platform`.

## ADDED Requirements

### Requirement: Modules package provides Nest infra
`@helloworld/modules` MUST provide reusable Nest modules/helpers for config validation from root env, database access, health checks, Better Auth wiring, and OpenAPI setup for Nest apps.

#### Scenario: API depends on modules for boot infra
- **WHEN** `apps/api` is scaffolded
- **THEN** it boots using `@helloworld/modules` for config/db/health/auth/openapi rather than reimplementing those cross-cuts inline

### Requirement: Domain logic not owned by modules package
Business use-cases MUST live in `@helloworld/platform` (or app-local thin wrappers over it). `@helloworld/modules` MUST remain infrastructure-focused and MUST NOT become the home for entity CRUD services.

#### Scenario: Person create is not a modules export
- **WHEN** a developer looks for “create person” application logic
- **THEN** it is expected under `@helloworld/platform`, not as the primary API of `@helloworld/modules`

### Requirement: Root env only for Nest config
Nest config modules MUST validate a Zod subset of the single repo-root `.env` / process env and MUST NOT require `apps/*/.env` files.

#### Scenario: No per-app env file required
- **WHEN** starting the API from the repo root with root `.env` present
- **THEN** configuration loads without an `apps/api/.env`
