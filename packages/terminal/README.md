# terminal

Shared toolkit for **terminal tools** under `tools/` (`cli`, `tui`, later shell-style tools).

Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagesterminal).  
Build: `tsc` → `dist/` — [`Build / emit contract`](../../spec/tech-stack.md#build--emit-contract).

**Not** for `apps/web`. **Not** `packages/config` (tsconfig/vitest/oxlint).

## Modules

| Subpath | Role |
|---|---|
| `@helloworld/terminal/config` | User config — `env-paths` + Zod (scaffold) |
| `@helloworld/terminal/log` | **tslog** diagnostics on stderr + **ora** spinners; stdout result helpers |
| `@helloworld/terminal/tty` | TTY helpers (scaffold) |

## API key storage

Long-term operator credentials for CLI/TUI live in **`@helloworld/terminal/config`**, not in the repo-root `.env`. Spec: [`tech-stack.md` § Auth](../../spec/tech-stack.md#auth-better-auth); mutator: [`packages/api-client`](../api-client/README.md#auth-header--configureclient).

| Concern | Contract |
|---|---|
| Where | XDG user config via `env-paths('helloworld').config` (typical `~/.config/helloworld/config.json`) |
| Per environment | Named envs (`local` / `dev` / `prod`, …) each hold their own credential |
| Field name | **`apiKey`** (Zod / JSON) — optional until authenticated calls are needed |
| Pass-through | Resolve → `configureClient({ apiUrl, apiKey })` → header **`x-api-key`** |
| Issue / revoke | Web settings UI, or CLI subcommand against an authenticated API — Better Auth managed keys |
| Forbidden | Root `.env` / static `API_KEY` as the long-term CLI/TUI key store; do not commit keys |

`apiUrl` / `workerUrl` (and other config fields) may be documented further under tech-stack **#15**; for Auth **#5** the frozen credential field is **`apiKey`** per environment.

## Logging (`@helloworld/terminal/log`)

| Export | Role |
|---|---|
| `log` / `createLogger` | tslog **5.2.0** pretty → **stderr** |
| `setVerbose` | DEBUG vs INFO on shared `log` (e.g. `--verbose`) |
| `printResult` / `printJson` | Command **results** → **stdout** |
| `spinner` / `withSpinner` | ora **9.4.1** on stderr (safe to `log.*` while spinning) |
| `exitOk` / `exitError` | Exit `0` / `1` |

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
