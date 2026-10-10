# Proposal

## Why

API and MCP must share the same application/use-case layer so domain behaviour and adapters to Postgres, object storage, search, and the knowledge graph stay in one place. Without that layer, each app would grow its own access to engines and later stack swaps would break the “API + MCP as facade” constant. External clients (web, CLI, TUI) already have `@helloworld/api-client`; the missing piece is the in-process platform client for server-side apps.

## What Changes

- Add workspace package `@helloworld/platform` under `packages/platform` with the build/emit contract (`tsc` → `dist/`).
- Define package boundaries: use-cases + engine adapters for `apps/api` and `apps/mcp`; no HTTP/Orval, no Nest HTTP controllers, no CLI/web UI.
- Document dependency direction vs `@helloworld/types`, `@helloworld/modules`, and `@helloworld/api-client` in package README and `packages/README.md` / tech-stack pointers.
- Scaffold a minimal public surface (empty or placeholder use-case namespace) so later domain/impex/search changes have a home — **no** real Postgres/S3/search/graph wiring in this change.

## Capabilities

### New Capabilities

- `platform-client`: In-process application client shared by API and MCP — use-case facade and adapter boundary to external engines; stable seam when engines change.

### Modified Capabilities

- (none — main OpenSpec specs still empty / bootstrap not archived)

## Impact

- **New:** `packages/platform` (package.json, tsconfig, src, README).
- **Docs:** `packages/README.md`, short pointer in `spec/tech-stack.md` shared-packages inventory.
- **Consumers (later waves):** `apps/api`, `apps/mcp` depend on `@helloworld/platform`; they do not call search/graph/S3 SDKs directly from controllers/tools.
- **Non-consumers:** `tools/cli`, `tools/tui`, `apps/web` keep using `@helloworld/api-client` only.
- **Out of scope:** Implementing domain CRUD, impex, search/graph adapters, Nest module registration, MCP tool wiring.
