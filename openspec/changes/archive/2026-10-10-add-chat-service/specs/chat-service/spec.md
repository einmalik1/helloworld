# Spec Delta

## Purpose

Defines the server-side chat component: authenticated conversations and messages, streaming assistant replies, and an LLM adapter boundary so `apps/web` never holds provider secrets.

## ADDED Requirements

### Requirement: Dedicated chat application owns LLM integration
LLM provider calls, tool loops, and provider credentials MUST execute only inside `apps/chat` (or libraries it alone loads for that purpose). `apps/web`, CLI, and TUI MUST NOT embed provider API keys or call provider APIs directly.

#### Scenario: Browser has no provider key
- **WHEN** a user chats from the web UI
- **THEN** network traffic from the browser goes to the chat (or API) origin, not to the LLM vendor with a vendor API key in the client

### Requirement: Web is a client of the chat service
The web chat UI MUST use the chat service’s product HTTP (and streaming) contract to create conversations, post user messages, and receive assistant tokens/events. Domain CRUD remains on `apps/api`; chat MUST NOT become a second general-purpose domain API.

#### Scenario: Send message returns stream
- **WHEN** an authenticated user posts a message to an existing conversation
- **THEN** the chat service accepts the message and streams the assistant response to the client until completion or error

### Requirement: Conversations and messages are persisted
Conversations and messages MUST be stored durably (Postgres via the data-model SoT) with stable IDs, timestamps, role (`user` | `assistant` | `system` | `tool` as applicable), and content. Listing a conversation MUST return prior messages in order.

#### Scenario: Reload shows history
- **WHEN** a user reopens a conversation they own
- **THEN** previously stored messages are returned in chronological order

### Requirement: Chat endpoints require authentication
Chat HTTP routes MUST require Better Auth session and/or `x-api-key` unless explicitly marked `@Public()`. Unauthenticated callers MUST be rejected for conversation create/list/message operations.

#### Scenario: Anonymous cannot create conversation
- **WHEN** an unauthenticated client tries to create a conversation
- **THEN** the request is rejected with an auth failure status

### Requirement: LLM provider is swappable behind an adapter
The chat service MUST invoke models through an internal adapter interface. Changing providers MUST NOT require `apps/web` contract changes.

#### Scenario: Provider swap keeps web contract
- **WHEN** operators switch the configured LLM provider adapter
- **THEN** web clients continue to use the same chat HTTP/streaming endpoints
