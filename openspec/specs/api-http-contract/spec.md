# api-http-contract Specification

## Purpose
Defines the HTTP product contract for `apps/api`: error bodies (RFC 9457 Problem Details), status mapping, list/CRUD conventions, and fixed infrastructure routes that all resources and clients share. See [ADR 0002](../../decisions/0002-api-http-contract.md).

## Requirements

### Requirement: RFC 9457 Problem Details errors
API error responses MUST use RFC 9457 Problem Details (`application/problem+json`) with `type`, `title`, `status`, `detail`, and MAY include extension `errors` for field-level Zod issues. Controllers MUST NOT invent per-route alternate error JSON shapes.

#### Scenario: Not found uses Problem Details
- **WHEN** a client requests a missing resource by id
- **THEN** the response is `application/problem+json` with a 404 `status` and a `detail` (not a legacy `{ "error" }` envelope alone)

### Requirement: Error class to HTTP status mapping
Domain/service errors MUST map to HTTP statuses via typed error classes (e.g. not found → 404, validation → **400**, database failure → 500). Status MUST NOT be inferred by parsing error message text. Validation MUST NOT use 422 in this stack.

#### Scenario: Validation does not become 404 via string match
- **WHEN** a validation error is returned from the service layer
- **THEN** the HTTP status is **400** from the map, not derived from `message.includes("not found")`

### Requirement: List and CRUD conventions
Collection list endpoints MUST accept pagination query params `page` and `limit` (with a documented max). Resource IDs MUST be UUIDs. Create MUST return `201`; successful delete MUST return `204`. PATCH MUST apply partial updates consistent with generated Update DTOs.

#### Scenario: Create returns 201
- **WHEN** a client successfully creates a resource via POST
- **THEN** the response status is `201` and includes the created resource representation

### Requirement: Fixed infrastructure routes
The API MUST expose `GET /health` (public), `GET /api/docs` (Swagger UI), and `GET /openapi.json` (OpenAPI document) as the documented fixed routes.

#### Scenario: Health is reachable without auth
- **WHEN** an unauthenticated client calls `GET /health`
- **THEN** the endpoint responds without requiring a session or API key
