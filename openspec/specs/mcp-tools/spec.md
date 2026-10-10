# mcp-tools Specification

## Purpose
Defines how agents reach domain behaviour through MCP: tools map to `@helloworld/platform` use-cases in-process, not through the external HTTP `api-client` SDK.

## Requirements

### Requirement: MCP uses platform in-process
`apps/mcp` MUST invoke domain operations via `@helloworld/platform` (in-process). MCP MUST NOT use `@helloworld/api-client` as its primary domain transport.

#### Scenario: Tool does not Orval-call the API by default
- **WHEN** an MCP tool creates or lists a domain resource
- **THEN** the implementation calls platform use-cases rather than the generated REST client

### Requirement: Tool semantics align with API facade
MCP tool names and arguments MUST expose the same domain semantics as the product API (resources and actions), so agents and HTTP clients share one behavioural model.

#### Scenario: Greeting create exists on both surfaces
- **WHEN** greetings can be created via the API
- **THEN** an MCP tool exists (or is planned in backlog) that creates a greeting through the same platform use-case rules

### Requirement: Auth for MCP matches machine clients
MCP connections that hit protected domain operations MUST authenticate with the same machine-oriented Better Auth API-key model (or equivalent documented service credential), not anonymous DB access.

#### Scenario: No direct DB from MCP
- **WHEN** MCP performs a domain write
- **THEN** it goes through platform (and thus normal persistence/auth rules), not raw SQL from the MCP process as a bypass
