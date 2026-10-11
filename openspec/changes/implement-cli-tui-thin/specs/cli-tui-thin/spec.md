## ADDED Requirements

### Requirement: Shared terminal config for CLI and TUI

`@helloworld/terminal/config` MUST load and save a Zod-validated user config under `env-paths('helloworld').config` (typical `~/.config/helloworld/config.json`). Per-environment fields MUST use frozen keys `apiUrl`, `workerUrl`, and optional `apiKey`. Global fields MUST include `environment`, `pollInterval` (default 30, range 5–300), and `pageSize` (default 15, range 5–100). A missing file MUST yield safe local defaults. A corrupt or unreadable file MUST hard-error (no silent fallback). CLI `--env` MUST override the active environment for the process only via an override helper and MUST NOT rewrite the persisted `environment` field.

#### Scenario: Missing config yields local defaults

- **WHEN** no config file exists on disk
- **THEN** load returns defaults with `environment` `local` and a `local` environment entry containing default `apiUrl` / `workerUrl`

#### Scenario: Corrupt config fails hard

- **WHEN** the config file exists but fails Zod validation or cannot be read
- **THEN** load throws (or otherwise hard-errors) without substituting production URLs with localhost

### Requirement: API client mutator for machine clients

`@helloworld/api-client` MUST expose `configureClient({ apiUrl, apiKey? })`, Orval mutator `customFetch`, and `fetchHealth` with normative timeouts (general 30s, health 3s). When `apiKey` is set, every request MUST send header `x-api-key`. When omitted, that header MUST NOT be set.

#### Scenario: configureClient sets x-api-key

- **WHEN** a caller configures the client with an `apiKey` and issues a request
- **THEN** the outbound request includes `x-api-key` with that value

### Requirement: Installable CLI thin client

`tools/cli` MUST package binary `helloworld` (Commander) that wires `@helloworld/terminal/config` + `@helloworld/terminal/log` + `@helloworld/api-client`. It MUST support global `--env` and `--json`, baseline commands `health` (parallel api + worker `/health` via `fetchHealth`) and `config list|set|unset|env`, exit `0` on success and `1` on HTTP/config/usage errors, and MUST NOT import Ink/React or Nest/DB/Pino.

#### Scenario: health command aggregates probes

- **WHEN** an operator runs `helloworld health` with a valid local config pointing at reachable services
- **THEN** the CLI probes api and worker health and prints a text (or `--json`) result with exit `0` when both succeed

#### Scenario: config list reads XDG file

- **WHEN** an operator runs `helloworld config list`
- **THEN** the CLI prints the resolved local config without contacting Nest

### Requirement: Installable TUI thin client

`tools/tui` MUST package binary `helloworld-tui` (Ink + React) that requires an interactive TTY (non-TTY MUST exit with a hint to use the CLI). It MUST share the same XDG config via `@helloworld/terminal/config`, MAY persist environment changes from the UI, show api+worker health, and MUST NOT import Commander.

#### Scenario: Non-TTY exits with CLI hint

- **WHEN** `helloworld-tui` is launched without an interactive TTY
- **THEN** the process exits non-zero and prints a message directing the operator to the CLI
