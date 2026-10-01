# tui

Installable **interactive** terminal UI for Hello World. Talks to `apps/api` and `apps/worker` over HTTP.

Separate from [`tools/cli`](../cli/README.md) (Commander). Stack inventory: [`spec/tech-stack.md`](../../spec/tech-stack.md#terminal-clients-toolscli-toolstui).

## Role

Operator UI: browse status, confirm actions, edit local/remote settings in an alternate-screen Ink app.  
**Not** NestJS, no database, no logging stack. Requires an interactive TTY (non-TTY → exit with hint to use the CLI).

| Concern | Choice |
|---|---|
| UI | Ink **7.1.1** + React **19.3.0** |
| Text fields | `ink-text-input` **6.0.0** |
| HTTP | ky **2.1.0** via `packages/api-client` (when wired) |
| Validation | Zod (local config schema) |
| Shared types | `packages/types` (when wired) |
| Binary | `helloworld-tui` → `bin/run.js` → built entry |
| Tests | Vitest under `tools/tui` (and `tests/tui` for interaction/snapshots) |

## Layout (intent)

```text
tools/tui/
├── bin/run.js
├── package.json                 # bin: helloworld-tui
├── src/
│   ├── main.tsx                 # Entry — TTY check, render <App />
│   ├── app.tsx                  # Root state: tabs, selection, overlays, poll, health
│   ├── api.ts                   # thin wiring → packages/api-client
│   ├── config.ts                # XDG path, Zod schema, environments
│   └── tui/
│       ├── types.ts             # Tab, Toast, ConfirmAction, …
│       ├── tabs/                # One view per tab
│       ├── overlays/            # Modal flows (confirm, edit, env, …)
│       └── components/          # Banner, footer, health box, formatters
└── test/
```

No Commander imports in this package. CLI stays in `tools/cli`.

## Configuration

Same XDG file as the CLI: `$XDG_CONFIG_HOME/helloworld/config.json` / `~/.config/helloworld/config.json`.

TUI-oriented keys (in addition to URLs / credentials):

| Key | Scope | Meaning |
|---|---|---|
| `environment` | global | Active env (switch in UI; persists) |
| `pollInterval` | global | Background refresh (e.g. 5–300 s) |
| `pageSize` | global | List page size |

TUI **persists** environment changes. CLI `--env` does not rewrite this file.

## UI patterns (intent)

- Render with Ink **alternate screen**.
- Root holds UI state; open overlay → global hotkeys disabled (overlay owns input).
- Tabs for primary areas (status / domain lists / settings / local config — exact set follows features).
- Confirm overlay before destructive or pipeline-starting actions.
- Toast for success/error; `HealthBox` for api + worker reachability.
- Background polling per `pollInterval`.

Domain-specific keybindings and tabs are defined when features land — keep this README structural, not product-command encyclopedic.

## Local

**Prerequisites:** services this UI observes. Root [Local development](../../README.md#local-development).  
No `tools/tui/.env` — service env is root `.env`; user preferences are the XDG config.

```bash
pnpm run --filter tui dev
pnpm run --filter tui build
# once packaged:
helloworld-tui
```

## Boundaries

| | `apps/api` / `apps/worker` | `tools/tui` |
|---|---|---|
| Role | Source of truth, DB, jobs | Thin interactive client |
| Persist | PostgreSQL / object store | XDG config JSON only |
| Errors | neverthrow / HTTP mapping | Toast / fatal exit |
| Auth | Better Auth (server) | Sends credentials from local config (flow TBD) |
