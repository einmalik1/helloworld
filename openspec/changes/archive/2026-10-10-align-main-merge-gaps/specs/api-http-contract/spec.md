# Spec Delta

## ADDED Requirements

### Requirement: Request correlation via x-request-id
The API MUST accept or generate an `x-request-id` on each request, bind it into structured logs (e.g. Pino `requestId`), echo it on the response, and include it on Problem Details error bodies as `requestId` (or equivalent documented extension).

#### Scenario: Error carries request id
- **WHEN** a request fails with a Problem Details body
- **THEN** the body includes the correlation id for that request and the response headers expose `x-request-id`
