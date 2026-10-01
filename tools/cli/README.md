# cli

Installable **non-interactive** command-line client for Hello World. Talks to `apps/api` and `apps/worker` over HTTP.

Separate from [`tools/tui`](../tui/README.md) (Ink UI). Stack inventory: [`spec/tech-stack.md`](../../spec/tech-stack.md#terminal-clients-toolscli-toolstui).

## Role

Thin client: local config → HTTP → print result / exit code.  
**Not** NestJS, no database, no logging stack, no Playwright.

| Concern | Choice |
|---|---|
| Framework | Commander **15.0.0** |
| HTTP | ky **2.1.0** via `packages/api-client` (when wired) |
| Validation | Zod (local config schema) |
| Shared types | `packages/types` (when wired) |
| Binary | `helloworld` → `bin/run.js` → built entry |
| Tests | Vitest under `tools/cli` (and `tests/cli` for service-backed runs) |

## Layout (intent)

```text
tools/cli/
├── bin/run.js                 # Shebang shim → dist entry
├── package.json               # bin: helloworld
├── src/
│   ├── cli.ts                 # Entry — Commander program
│   ├── commands.ts            # Root program + global flags
│   ├── commands/
│   │   ├── shared.ts          # Shared flag types / printers
│   │   ├── config.ts          # Local config CRUD / env
│   │   ├── health.ts          # api + worker /health
│   │   └── …                  # Domain commands as features land
│   ├── api.ts                 # thin wiring → packages/api-client (or temporary local until package exists)
│   └── config.ts              # XDG path, Zod schema, environments
└── test/
```

No Ink / React imports in this package.

## Configuration

Path: `$XDG_CONFIG_HOME/helloworld/config.json` or `~/.config/helloworld/config.json`  
(same file as the TUI — shared environments).

Intent (shape may grow with features):

```json
{
  "environment": "local",
  "environments": {
    "local": { "apiUrl": "http://localhost:…", "workerUrl": "http://localhost:…", "credential": "…" },
    "dev": {},
    "prod": {}
  }
}
```

| Key | Scope | Meaning |
|---|---|---|
| `apiUrl` / `workerUrl` | per environment | Base URLs for ky `prefixUrl` |
| credentials | per environment | As required by API auth (Better Auth client flow TBD) |
| `environment` | global | Default env for TUI; CLI overrides via `--env` |

Missing file → safe defaults for local. Corrupt/unreadable file → hard error (no silent prod→localhost fallback).

**CLI vs TUI on env:** CLI is **stateless** for environment — `--env <local|dev|prod>` overrides for the process only and does not rewrite the persisted `environment` field.

## Global flags (intent)

| Flag | Default | Effect |
|---|---|---|
| `--env <local\|dev\|prod>` | from config / sensible default | Environment for this run only |
| `--json` | off | Raw JSON instead of tables/text |

## Commands (intent)

Scaffold when features exist. Baseline ops:

| Command | Role |
|---|---|
| `helloworld health` | Parallel `api` + `worker` `/health` |
| `helloworld config list \| set \| unset \| env` | Local config / environment |
| `helloworld …` | Domain subcommands against the REST API |

Exit codes: `0` success, `1` HTTP / config / usage error.

## Local

**Prerequisites:** target services running. Root [Local development](../../README.md#local-development).  
Config from the **root** `.env` for services; this tool’s user config is the XDG file above — do not add `tools/cli/.env`.

```bash
pnpm run --filter cli dev
pnpm run --filter cli build
# once packaged:
helloworld health
helloworld --json health
helloworld --env local config list
```

## Boundaries

| | `apps/api` / `apps/worker` | `tools/cli` |
|---|---|---|
| Role | Source of truth, DB, jobs | Thin client |
| Persist | PostgreSQL / object store | XDG config JSON only |
| Errors | neverthrow / HTTP mapping | throw → exit `1` |
