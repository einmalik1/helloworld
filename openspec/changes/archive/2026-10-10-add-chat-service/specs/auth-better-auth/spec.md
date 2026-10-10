# Spec Delta

## ADDED Requirements

### Requirement: Chat service uses the same auth mechanisms
`apps/chat` MUST authenticate interactive users via Better Auth sessions (cookies / trusted origin rules aligned with `WEB_ORIGIN`) and machine clients via managed API keys (`x-api-key`) consistent with the API. Chat MUST NOT invent a parallel static env API key auth for product traffic.

#### Scenario: Session cookie accepted on chat
- **WHEN** a signed-in web user calls a protected chat route with the session cookie
- **THEN** the chat service accepts the identity without requiring a separate chat-only login system
