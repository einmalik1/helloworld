# terminal

Shared toolkit for **terminal tools** under `tools/` (`cli`, `tui`, later shell-style tools).

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesterminal).  
Build: `tsc` → `dist/` — [`Build / emit contract`](../../openspec/tech-stack.md#build--emit-contract).

**Not** for `apps/web`. **Not** `packages/config` (tsconfig/vitest/oxlint).

## Modules

| Subpath                       | Role                                                                      |
| ----------------------------- | ------------------------------------------------------------------------- |
| `@helloworld/terminal/config` | User config — `env-paths` + Zod (scaffold)                                |
| `@helloworld/terminal/log`    | **tslog** diagnostics on stderr + **ora** spinners; stdout result helpers |
| `@helloworld/terminal/tty`    | TTY helpers (scaffold)                                                    |

## Config keys (normative)

Owned by `@helloworld/terminal/config`. Persisted under XDG (typical: `$XDG_CONFIG_HOME/helloworld/config.json`). Same file for CLI and TUI — see [`tools/cli/README.md`](../../tools/cli/README.md) / [`tools/tui/README.md`](../../tools/tui/README.md). Auth inventory: [`tech-stack.md` § Auth](../../spec/tech-stack.md#auth-better-auth); mutator: [`packages/api-client`](../api-client/README.md#auth-header--configureclient).

### Frozen environment fields (Zod schema intent)

Per named environment (`local` / `dev` / `prod`, …), freeze these key names:

| Key | Required | Role |
|---|---|---|
| `apiUrl` | yes (for API calls) | Base URL → api-client `configureClient({ apiUrl })` / ky `prefixUrl` |
| `workerUrl` | yes (for worker probes) | Base URL for worker `GET /health` (and later job-control) |
| `apiKey` | no (optional until authenticated calls) | Better Auth managed API key → api-client `configureClient({ apiKey })` → header **`x-api-key`** |

- **Do not** invent alternate spellings (`baseUrl`, `api_url`, static env `API_KEY`).  
- Semantic alias “credential” in operator docs means the **`apiKey`** field — the Zod / JSON key is **`apiKey`**.  
- Pass resolved values into `@helloworld/api-client` (`apiUrl` / `apiKey`); health probes use the **3s** timeout — [`packages/api-client` Timeouts](../api-client/README.md#timeouts-normative).
- **Issue / revoke** keys via web settings UI (or an authenticated CLI subcommand) — Better Auth managed entities.  
- **Forbidden:** root `.env` / static `API_KEY` as the long-term CLI/TUI key store; do not commit keys.

### Global fields (also in schema)

| Key | Default / range | Role |
|---|---|---|
| `environment` | e.g. `local` | Active env name (TUI persists; CLI `--env` overrides for the process only) |
| `pollInterval` | **30** (range 5–300) | TUI background refresh seconds |
| `pageSize` | **15** (range 5–100) | TUI / list page size |

Missing file → safe local defaults. Corrupt / unreadable file → **hard error** (no silent fallback).

```ts
// packages/terminal — Zod intent for @helloworld/terminal/config
const environmentSchema = z.object({
  apiUrl: z.string().url(),
  workerUrl: z.string().url(),
  apiKey: z.string().min(1).optional(),
});

const configSchema = z.object({
  environment: z.string().min(1).default("local"),
  environments: z.record(environmentSchema),
  pollInterval: z.number().int().min(5).max(300).default(30),
  pageSize: z.number().int().min(5).max(100).default(15),
});
```

## Logging (`@helloworld/terminal/log`)

| Export                      | Role                                                     |
| --------------------------- | -------------------------------------------------------- |
| `log` / `createLogger`      | tslog **5.2.0** pretty → **stderr**                      |
| `setVerbose`                | DEBUG vs INFO on shared `log` (e.g. `--verbose`)         |
| `printResult` / `printJson` | Command **results** → **stdout**                         |
| `spinner` / `withSpinner`   | ora **9.4.1** on stderr (safe to `log.*` while spinning) |
| `exitOk` / `exitError`      | Exit `0` / `1`                                           |

```ts
import { log, printJson, withSpinner } from "@helloworld/terminal/log";

await withSpinner("Calling api…", async () => {
  log.info("request sent");
  // …
});
printJson({ ok: true });
```

No Pino here — services use Pino; CLI/TUI use this package.

## Consumers

`tools/cli`, `tools/tui`. Web does not depend on this package.
