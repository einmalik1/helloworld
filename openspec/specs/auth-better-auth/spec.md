# auth-better-auth Specification

## Purpose
Defines authentication for Hello World: Better Auth sessions for web and managed API keys for CLI/TUI/machines, verified by the API without static env API keys.

## Requirements

### Requirement: Better Auth is the auth system
The API MUST use Better Auth for authentication. A static shared `API_KEY` environment secret as the sole auth mechanism is forbidden.

#### Scenario: No static API_KEY as sole gate
- **WHEN** auth is configured for the API
- **THEN** access control is based on Better Auth sessions and/or managed API keys, not a single hardcoded env key module

### Requirement: Sessions for web, API keys for tools
Browser clients MUST authenticate with Better Auth sessions (cookies). CLI, TUI, and machine clients MUST authenticate with Better Auth managed API keys (header documented in api-client, candidate `x-api-key`).

#### Scenario: Tool client sends API key
- **WHEN** the CLI calls a protected API route with a valid managed API key
- **THEN** the request is authorized without a browser session cookie

### Requirement: Public route opt-out
Routes that must be anonymous (at minimum `GET /health`) MUST be markable as public (`@Public()` or equivalent) so the global auth guard does not require credentials.

#### Scenario: Health stays public
- **WHEN** the global auth guard is enabled
- **THEN** `GET /health` remains callable without credentials
