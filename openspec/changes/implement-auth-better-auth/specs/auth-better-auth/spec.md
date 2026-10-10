## ADDED Requirements

### Requirement: Better Auth HTTP routes are mounted under /api/auth
`apps/api` MUST mount Better Auth HTTP handlers under `/api/auth` via the `@helloworld/modules` helper (`mountBetterAuth`). The Better Auth instance `basePath` MUST match that mount. Nest MUST NOT reimplement sign-in/sign-up/session/API-key HTTP handlers.

#### Scenario: Auth mount path is public infrastructure
- **WHEN** an anonymous client calls a Better Auth HTTP route under `/api/auth`
- **THEN** the Nest global auth guard does not require a session cookie or `x-api-key` for that path

### Requirement: Global guard accepts session or x-api-key
The Nest global auth guard in `@helloworld/modules` MUST authorize a request when either (a) a valid Better Auth session is present (cookie headers), or (b) header `x-api-key` verifies via Better Auth `verifyApiKey`. Requests lacking both MUST be rejected with HTTP 401 unless the handler/controller is `@Public()` or the path is infrastructure-public (`/health`, `/api/auth`, `/api/docs`, `/openapi.json`).

#### Scenario: Missing credentials on protected route
- **WHEN** a client calls a non-public Nest route without a session cookie and without `x-api-key`
- **THEN** the response is HTTP 401

#### Scenario: Valid API key header authorizes
- **WHEN** a client calls a protected Nest route with a valid managed API key in header `x-api-key`
- **THEN** the guard allows the request without requiring a browser session cookie

### Requirement: api-client configureClient sets x-api-key
`@helloworld/api-client` MUST export `configureClient({ apiUrl, apiKey? })` that configures the ky client with `prefixUrl` from `apiUrl` and, when `apiKey` is provided, sets request header `x-api-key` on every request via a beforeRequest hook. When `apiKey` is omitted, the client MUST NOT add an API-key header. The header name MUST be exactly `x-api-key` (no `Authorization: Bearer` for API keys in v1).

#### Scenario: configureClient with apiKey
- **WHEN** a tool calls `configureClient({ apiUrl, apiKey })` and issues a request through the shared mutator
- **THEN** the outbound request includes header `x-api-key` with that key value

#### Scenario: configureClient without apiKey
- **WHEN** a caller configures only `apiUrl` and issues a request
- **THEN** the outbound request does not include an `x-api-key` header
