## Why

Wave C needs installable thin terminal clients so operators can probe health and manage local XDG config without Nest/DB in-process. `tools/cli` and `tools/tui` exist as README-only stubs; `packages/terminal` config/tty and `packages/api-client` HTTP mutator are still scaffolds, so Commander/Ink cannot talk to `apps/api` yet.

## What Changes

- Implement `@helloworld/terminal/config` (Zod + `env-paths`) and `@helloworld/terminal/tty` per terminal README / tech-stack.
- Wire `@helloworld/api-client` hand mutator (`configureClient`, `customFetch`, `fetchHealth`, `x-api-key`) so tools can call the API; Orval generation remains skip-until-openapi.
- Scaffold `tools/cli` (`helloworld`): Commander, global `--env` / `--json`, baseline `health` + `config` commands via terminal + api-client.
- Scaffold `tools/tui` (`helloworld-tui`): Ink + React alternate-screen shell with TTY gate, health box, settings/config tab — no Commander.
- Add package smoke (Vitest) for CLI config/health wiring and TUI TTY gate; typecheck/build for new workspaces.
- Do **not** re-open facade ADRs 0001–0006; do **not** implement domain CRUD subcommands (Wave B surfaces land later).

## Capabilities

### New Capabilities

- `cli-tui-thin`: Thin installable CLI and TUI clients over shared terminal toolkit + api-client HTTP.

### Modified Capabilities

- (none)

## Impact

- Primary: `tools/cli`, `tools/tui`, `packages/terminal` (config/tty), `packages/api-client` (ky mutator).
- Consumes: Nest `GET /health` when services run; works offline for config CRUD / TTY gate smokes.
- Prefers `#41` auth header contract (`x-api-key`) without waiting on Better Auth product UX.
- Unlocks later domain commands/tabs once CRUD APIs exist.
