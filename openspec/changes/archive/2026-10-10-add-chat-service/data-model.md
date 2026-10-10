# Data Model

## Summary

Add chat persistence: conversation ownership and ordered messages. No change to person/channel/greeting core beyond FKs.

## schema.sql changes

- **`conversation`**: id (uuid), owner_person_id → person, title (nullable text), created_at, updated_at; category metadata via COMMENT ON TABLE
- **`message`**: id (uuid), conversation_id → conversation (cascade), role (text check or constrained values), content (text), created_at; optional sequence/index for ordering
- Indexes: list conversations by owner; list messages by conversation_id + created_at

## Generate

- [ ] After SQL lands: `pnpm generate:code` (types, api zod, nest DTOs as applicable)
- [ ] Confirm ERD under `openspec/data-model/generated/` includes conversation/message

## Notes

Tool-call payloads MAY be stored as message content or a later jsonb column — v1 keeps `content` text unless apply needs structured tool rows.
