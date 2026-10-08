# Tech stack

Chosen technologies for Hello World. Keep this inventory factual.

Architecture (components and boundaries) stays technology-agnostic in [`architecture.md`](architecture.md).  
Rationale for contested choices lives in [`decisions/`](decisions/).

Versions below are the latest published on npm as of 2026-10-08 (pin in lockfile when wiring packages).

## Inventory

| Area | Choice | Version | Notes |
|---|---|---|---|
| Package manager | pnpm | 12.8.1 | Workspace + lockfile `pnpm-lock.yaml` |
| Language | TypeScript | 7.0.2 | Across the monorepo |
| Typecheck | `tsc --noEmit` | (via typescript) | CI/local gate: typecheck only, no JS emit — see below |
| Runtime | Node.js | **26.7.0** | Exact patch in root **`.nvmrc`**; root **`engines.node`**: `>=26 <27` (CI + local stay aligned) |
| Monorepo tooling | Turborepo | 2.11.6 | `turbo` — builds/tasks across the workspace |
| Validation / type SoT | Zod | 4.6.5 | Schemas as source of truth; TS types derived — see OpenAPI note below |
| Service errors | neverthrow | 8.2.0 | Result types instead of thrown errors in the service layer |
| Logging | by surface | — | **Service** = Pino (+ pino-pretty local); **Web** = console/reporter; **CLI/TUI** = tslog + ora via `packages/terminal/log` |
| Web (`apps/web`) | React + Vite | react 19.3.0; **vite 8.3.4** | `react` / `react-dom`; bundler **Vite** (dev port `5173`) — see [Web](#web-appsweb) |
| UI kit (`apps/web`) | shadcn/ui + Tailwind | Tailwind **4.3.3** | [shadcn/ui](https://ui.shadcn.com/) (CLI-copied components) on Tailwind — see [Web](#web-appsweb) |
| Guided tours (`apps/web`) | driver.js | 1.9.0 | Product tours / highlights / feature intros — [driver.js](https://github.com/nilbuild/driver.js); zero deps, TypeScript; import `driver.js/dist/driver.css` |
| API (`apps/api`) | NestJS | 12.x | Express adapter + modules below |
| Worker (`apps/worker`) | NestJS standalone | 12.x | Same Nest line as API; jobs via `@nestjs/schedule` — see [Worker](#worker-appsworker) |
| Docs site (`apps/docs`) | Fumadocs on Next.js | fumadocs core/ui 16.15.17, mdx 15.4.5; **next 16.3.8** | [Fumadocs](https://github.com/fuma-nama/fumadocs) UI/MDX; host **Next.js** (App Router) — publishes `spec/` |
| Storybook (`apps/storybook`) | Storybook + `react-vite` | 10.6.1 | UI gallery; framework adapter **`@storybook/react-vite`** (matches Vite web) |
| MCP (`apps/mcp`) | `@modelcontextprotocol/sdk` | 1.32.1 | Remote **HTTP** MCP server; Pino logging — see [MCP](#mcp-appsmcp) |
| CLI (`tools/cli`) | Commander | 15.0.0 | Non-interactive terminal client; HTTP via `ky` — see Terminal clients below |
| TUI (`tools/tui`) | Ink + React | ink 7.1.1, react 19.3.0 | Interactive terminal UI; same API surface via `ky` — separate binary from CLI |
| HTTP client (cli/tui) | ky | 2.1.0 | Transport inside `@helloworld/api-client` (Orval mutator) |
| Client SDK codegen | Orval | 8.39.0 | OpenAPI → `packages/api-client/src/generated/` — see api-client below |
| TUI text input | `ink-text-input` | 6.0.0 | Editable fields in Ink overlays |
| ORM | Drizzle | orm 0.45.3, kit 0.31.11 | `drizzle-orm` + `drizzle-kit` |
| Database | PostgreSQL | 18.6 | Coolify one-click (`coolify database create postgresql`); pin image via `--image` when provisioning — see below |
| Object storage | Garage | Coolify service | S3-compatible; Coolify one-click Garage ([docs](https://coolify.io/docs/services/garage)); app client `@aws-sdk/client-s3` **3.1144.0** |
| Auth | Better Auth | 1.7.7 | `better-auth` + `@better-auth/api-key` **1.7.7** — sessions (web) and managed API keys (CLI/TUI/machines); see Auth below |
| Lint | Oxlint | 1.86.0 | `oxlint` |
| Format | Oxfmt | 0.71.0 | `oxfmt` (Oxformat) |
| Unit tests | Vitest | 5.0.3 | |
| E2E | Playwright | 1.63.0 | `@playwright/test` — `tests/e2e` |
| Visual regression | Visual Regression Tracker | remote | Self-hosted **outside** this repo; this app only connects — see below |
| Deploy | Coolify + Docker | CLI 1.8.0 | QA/Prod on Coolify; **one multi-stage Dockerfile per app** — Coolify builds from Git; see Coolify below |
| Shared libs (`packages/`) | types / modules / config / api-client / terminal | scaffolded | Intent + dirs; emit to `dist/` (except config) — see Shared packages + [Build / emit](#build--emit-contract) |
| API HTTP tests | Vitest + `@nestjs/testing` + **supertest** | — | Unit next to code; suite under `tests/api` — see Testing below |

## Monorepo tasks (Turbo)

Root scripts and filters: root [`README.md`](../README.md#scripts-root). Intent for `turbo.json` when wired:

| Task | Behaviour |
|---|---|
| `build` | `dependsOn: ["^build"]`, `outputs: ["dist/**"]` (plus app-specific outs e.g. `.next/**`) — workspace libs before apps |
| `dev` | Persistent, no cache; waits on `^build` for workspace libs |
| `test` | After `build` where required; cached |
| `lint` / `typecheck` / `format` | Per workspace, parallel via Turbo |

Also: `pnpm run docker:local:up` / `docker:local:down` for Compose stand-ins under `infra/` (see Local env / Coolify).

Emit contract (who builds what): [Build / emit contract](#build--emit-contract).

What may live in root `package.json`: [Root dependencies](#root-dependencies).

## Root dependencies

Root `package.json` is **orchestration + shared quality tooling only** — not an application package. Agents and CI run one `pnpm lint` / `pnpm format` / `pnpm typecheck` from the repo root.

| Allowed at root (`devDependencies`) | Role |
|---|---|
| `turbo` | Monorepo task runner |
| `oxlint`, `oxfmt` | Workspace-wide lint / format |
| `typescript` | Shared `tsc` / typecheck meta |
| `vitest` (optional meta) | Root test orchestration when useful; suite configs stay with packages / `tests/` |

**Not** at root: application or runtime libraries (Nest, React, Drizzle, ky, Better Auth, …). New libraries belong in the **consuming workspace** — add with `pnpm add <pkg> --filter <workspace>` from the repo root. Run workspace scripts the same way: `pnpm run --filter <pkg> …`.

Shared tooling config (tsconfig, oxlint, vitest presets) lives in `packages/config`; root only declares the CLIs that invoke them.

### Generators’ Python deps (outside npm)

Schema codegen under [`spark/generators/`](../spark/generators/) is **Python + Jinja2**, not an npm workspace. Deps are **not** listed in root or workspace `package.json`.

| Item | Location |
|---|---|
| Entry | `python3 spark/generators/run.py` (via root `pnpm generate*` scripts) |
| Venv | `spark/generators/.venv` — created on first `run.py` use |
| Packages | `jinja2`, `pyyaml` (installed into that venv; see `spark/generators/pyproject.toml`) |

Detail: [`spark/generators/README.md`](../spark/generators/README.md). Pipeline summary: [Schema generators](#schema-generators-sparkgenerators).

## Root environment

**One** repo-root `.env` (from [`.env.example`](../.env.example)), sections sorted by service — **never** `apps/*/.env` or `tools/*/.env`.

Processes started from the repo root read this file into `process.env`. Nest apps validate a **subset** via Zod `envSchema` in `createAppConfigModule` (keys still come from the same root file). Variable catalog and section headers live in `.env.example`; Nest-facing rules in [`apps/api/README.md`](../apps/api/README.md#configuration-root-env).

## Shared packages (`packages/`)

Workspace libraries under `packages/*` — directories exist; runtime wiring TBD. Apps and tools consume them as workspace deps after **`tsc` → `dist/`** (except `packages/config`). Module-level detail: each package README; emit rules: [Build / emit contract](#build--emit-contract).

Dependency direction (bottom → top):

```text
packages/config          # tooling only — no app deps
       ↑
packages/types           # zod only
       ↑
       ├── packages/modules    # types + NestJS + Drizzle + …  →  apps/api
       │
       ├── packages/terminal   # config + log + tty  →  tools/cli, tools/tui, (future terminal tools)
       │         ↑
       └── packages/api-client # types + ky (+ URLs/keys from terminal/config at call sites)
                 →  tools/cli, tools/tui, (optional apps/web — HTTP only, not packages/terminal)
```

| Package | Role | Runtime deps (intent) |
|---|---|---|
| `packages/types` | Domain Zod schemas, inferred TS types, shared error classes — no Nest/DB/services | `zod` |
| `packages/modules` | Reusable NestJS infrastructure modules for `apps/api` (and other Nest apps) | NestJS, Drizzle, postgres.js, Zod, neverthrow, `packages/types` |
| `packages/terminal` | Shared terminal toolkit: user config, **tslog** + **ora**, TTY helpers — for `tools/*` only | `tslog` **5.2.0**, `ora` **9.4.1**, `zod`, `env-paths` **4.0.0**, optionally `packages/types` |
| `packages/api-client` | Typed REST client SDK for `apps/api` + `apps/worker` — ky under the hood | `ky`, Zod, `packages/types` |
| `packages/config` | Shared tooling config only (tsconfig, vitest, oxlint) — no application code | none on other packages |

### `packages/types`

| Area | Intent |
|---|---|
| Zod schemas | Domain models first; TS types via `z.infer<>` |
| Error classes | Base + domain subclasses (`HTTPError`, `DatabaseError`, `ValidationError`, …) |
| Boundary | No services, no DB — schemas/types/errors only; app-local DTOs stay in the app |

### `packages/modules`

Cross-cutting Nest modules (subpath exports per module when wired):

| Module | Intent |
|---|---|
| Config | `createAppConfigModule({ envSchema })` — load root `.env`, validate at boot via Zod |
| Database | `DatabaseModule` + `DatabaseService` — Drizzle + PostgreSQL schema/queries |
| Health | `HealthModule` — `GET /health` (e.g. `@nestjs/terminus`) |
| Auth | Better Auth + `@better-auth/api-key` — Nest wiring (sessions + API-key verify guard) |
| OpenAPI | `setupOpenApi(app, options)` — Swagger UI + JSON; **nestjs-zod** `cleanupOpenApiDoc` on the exported document |
| Auth guards | Session and/or API-key verify; **`@Public()`** opt-out for routes such as `/health` |
| Logging (optional shared) | nestjs-pino `LoggerModule` bootstrap helper if extracted from apps |

### `packages/api-client`

Typed REST SDK generated by **Orval** from the Nest OpenAPI document. Transport **ky** via a hand-written mutator — do not hand-edit `src/generated/`.

| Area | Intent |
|---|---|
| Input | `apps/api` OpenAPI export (e.g. `apps/api/openapi.json` from `openapi:export`) |
| Codegen | **Orval 8.39.0** → `packages/api-client/src/generated/` |
| Transport | `src/http.ts` — ky mutator (base URL, API key / session headers) |
| Public API | `src/index.ts` — re-export generated client + thin facade helpers |
| Auth | Better Auth API key (or session) injected in mutator; tools pass config from `@helloworld/terminal/config` |
| Worker | Second Orval input later if worker exposes its own OpenAPI; until then only `apps/api` |
| Not in scope | NestJS, DB, Ink, Commander, Pino; no custom Python SDK generator |

```text
pnpm generate                             # code stages + Orval (client skips until openapi.json)
# or stepwise:
pnpm generate:code                        # core → nest_dto
pnpm --filter api openapi:export          # Nest → openapi.json (when api wired)
pnpm generate:client                      # Orval
```

**MCP:** not over this REST client. **Consumers:** `tools/cli`, `tools/tui`, optionally `apps/web` (web does not use `packages/terminal`).

Detail: [`packages/api-client/README.md`](../packages/api-client/README.md).

### `packages/terminal`

Shared **terminal toolkit** for tools under `tools/` (CLI, TUI, future shell-style tools). One package for common terminal concerns — not only config. Not for `apps/web`. Not to be confused with `packages/config` (dev tooling).

| Subpath | Intent |
|---|---|
| `config` | User config via `env-paths('helloworld').config` + Zod; environments; load/save; resolve URLs+key; `overrideEnvironment` for CLI `--env` |
| `log` | **tslog** pretty diagnostics on **stderr**; **ora** spinners on stderr; stdout = `printResult` / `printJson` only; exit `0`/`1`; **no Pino** |
| `tty` | TTY detection; non-interactive hints (e.g. TUI requires TTY → point at CLI) |

**Config resolve:** (1) value in active environment → (2) built-in defaults; missing file → defaults; corrupt file → hard error. CLI and TUI share one config file.

**Not in scope:** ky/HTTP, Commander, Ink, Nest, web session storage, Pino.

### `packages/config`

| Export | File (intent) | Purpose |
|---|---|---|
| tsconfig | `tsconfig.base.json` | Strict TS, ESM, decorators, `nodenext` |
| vitest | `vitest.config.ts` | Shared Vitest base (SWC/decorators as needed) |
| oxlint | `oxlintrc.json` | Shared lint rules |

Workspaces extend these bases (e.g. `"extends": "@helloworld/config/tsconfig"`).

## Terminal clients (`tools/cli`, `tools/tui`)

Two **separate** installable tools — not a dual-mode single binary. Same product, shared patterns; different UX and packaging.

| | CLI (`tools/cli`) | TUI (`tools/tui`) |
|---|---|---|
| Binary (intent) | `helloworld` | `helloworld-tui` |
| When | Scripts, CI, one-shot actions | Operator work: status, browse, confirm flows |
| Framework | **Commander 15** | **Ink 7** + **React 19** (+ `ink-text-input`) |
| Entry | Subcommands always | Interactive app (requires TTY) |
| Output | Text / `--json` | Alternate screen, tabs, overlays, toasts |
| Errors | throw → exit `1` | Toast / inline; exit on fatal |
| Persist | Local XDG config only | Same XDG config (read/write UI) |

**Shared intent (both tools):**

| Piece | Choice | Notes |
|---|---|---|
| Role | Thin clients for `apps/api` + `apps/worker` | No NestJS, no DB, no Pino; HTTP via `api-client`; shared toolkit via `packages/terminal` |
| HTTP | `packages/api-client` (ky underneath) | Tools do not own raw endpoint URLs long-term |
| Types | `packages/types` (via api-client) | No parallel domain shapes in the tools |
| Terminal toolkit | `packages/terminal` | `config` + `log` + `tty` — shared by CLI/TUI |
| User config | `@helloworld/terminal/config` | Shared XDG/`env-paths` file — not duplicated in each tool |
| Stdio / logging | `@helloworld/terminal/log` | **tslog** **5.2.0** (stderr) + **ora** **9.4.1** (spinners); stdout for results — see [Logging](#logging) |
| Config path | via `terminal/config` → typically `~/.config/helloworld/config.json` | Environments e.g. `local` \| `dev` \| `prod` |
| Quality | Vitest + oxlint/oxfmt via `packages/config` | Unit tests under each tool |
| Auth to API | Better Auth API key via `@better-auth/api-key` | Store per-environment in `terminal/config`; Nest verifies with `auth.api.verifyApiKey` |

**CLI-specific:** global flags such as `--env <local\|dev\|prod>` (process override, does not rewrite persisted env) and `--json`. Commands are domain features under `src/commands/` — scaffolded when features land.

**TUI-specific:** root holds UI state (tabs, selection, filters, overlays, health, polling). Overlays own input while open. No Commander imports in the TUI package; no Ink imports in the CLI package.

Detail and local usage: [`tools/cli/README.md`](../tools/cli/README.md), [`tools/tui/README.md`](../tools/tui/README.md).

## NestJS packages (`apps/api`)

| Package | Version | Role |
|---|---|---|
| `@nestjs/common` | 12.1.2 | DI, decorators, lifecycle |
| `@nestjs/core` | 12.1.2 | Application runtime |
| `@nestjs/platform-express` | 12.1.2 | HTTP server (Express adapter) |
| `@nestjs/config` | 12.0.1 | Env configuration (via shared config module) |
| `@nestjs/swagger` | 12.0.2 | OpenAPI at the REST endpoints (Swagger UI / document) |
| `@nestjs/terminus` | **12.1.0** | Health checks used by `packages/modules` HealthModule (Nest 12 line) |
| `@nestjs/schedule` | 12.0.2 | Cron / scheduled job triggers — **worker job model** (no separate broker in v1) |
| `@nestjs/testing` | 12.1.2 | Test modules (dev) |
| `nestjs-zod` | **5.5.0** | `createZodDto`, global `ZodValidationPipe`, OpenAPI cleanup |
| `nestjs-pino` | 5.3.0 | Nest logger integration — `LoggerModule` + `@InjectPinoLogger` |
| `pino` | 10.3.1 | Underlying logger (via nestjs-pino) |
| `pino-pretty` | **13.2.0** (dev) | Human-readable logs outside production |
| `postgres` | **3.4.9** | postgres.js driver for Drizzle |
| `supertest` | (dev) | HTTP integration tests against Nest |

### Nest conventions (summary)

Patterns for controllers, services (**neverthrow**), DTOs, exception filter, `@Public()`, and AppModule composition: **[`apps/api/README.md`](../apps/api/README.md#nestjs-conventions)**. Shared infra module contracts: [`packages/modules/README.md`](../packages/modules/README.md).

## Worker (`apps/worker`)

Long-running Nest **standalone** app for background / scheduled work. Shares `packages/modules` (Config / Database / Health / Logging) with `apps/api` — same DI, `/health`, and Pino pipeline.

| Decision | Choice | Notes |
|---|---|---|
| Runtime | Nest 12 standalone | Not a plain Node script; reusable Nest modules |
| Job model | **`@nestjs/schedule` 12.0.2** | Cron / interval triggers and in-process scheduled work. **No** separate queue broker (e.g. pg-boss) in v1 |
| HTTP surface | Internal only | `GET /health` (+ optional admin later). CLI/TUI may probe worker URLs from root `.env` |
| OpenAPI / Orval | **None in v1** | Not a second Orval input; typed clients stay on `apps/api` OpenAPI only |
| Logging | **Service** (Pino) | Same rules as `apps/api` — see [Logging](#logging) |
| Config | Root `.env` `# --- worker ---` | e.g. `WORKER_CONCURRENCY`; no `apps/worker/.env` |

Emit: Nest/`tsc` → `dist/` — [Build / emit contract](#build--emit-contract). Deploy: [Coolify](#coolify-build-deploy-data-services). App intent: [`apps/worker/README.md`](../apps/worker/README.md).

## MCP (`apps/mcp`)

Remote MCP server for agents. Thin process: tools/resources call **`apps/api` over HTTP** with a Better Auth **service API key** — do **not** embed Nest modules or use `packages/api-client`.

| Decision | Choice | Notes |
|---|---|---|
| SDK | **`@modelcontextprotocol/sdk` 1.32.1** | Official MCP TypeScript SDK |
| Transport | **HTTP** (remote) | Default for Coolify / remote agents; stdio not the v1 deploy path |
| Domain access | HTTP → `apps/api` | Service API key; keeps MCP thin; **no** `packages/api-client` |
| Logging | **Service** (Pino) | Long-running HTTP Node server → Pino / stdout (not tslog) |
| Config | Root `.env` `# --- mcp ---` | `MCP_HOST` / `MCP_PORT` (example `3100`); no `apps/mcp/.env` |

Emit: `dist/` when scaffolded. Deploy: Coolify Application — [Docker images](#docker-images-per-app). App intent: [`apps/mcp/README.md`](../apps/mcp/README.md).

## Web (`apps/web`)

React SPA (or SPA-style app) with **Vite**. Storybook uses the matching **`react-vite`** adapter.

| Decision | Choice | Notes |
|---|---|---|
| Bundler | **Vite 8.3.4** (+ `@vitejs/plugin-react` **6.1.2**) | Matches `WEB_PORT` / `WEB_ORIGIN` **`5173`** in [`.env.example`](../.env.example) |
| UI | **shadcn/ui** on **Tailwind CSS 4.3.3** | CLI-copied components; template default kit |
| Tours | driver.js **1.9.0** | Already in inventory |
| Data / API | Optional Orval `api-client` + cookie session | Better Auth session cookies to `apps/api`; web does **not** use `packages/terminal` |
| Storybook | `@storybook/react-vite` **10.6.1** | Same Vite toolchain as `apps/web` |
| Logging | Web client rules | `console` / UI; no Pino in the browser — see [Logging](#logging) |

Emit: Vite build out (not Nest `dist/main.js`) — [Build / emit contract](#build--emit-contract). Deploy: [Coolify](#coolify-build-deploy-data-services). App intent: [`apps/web/README.md`](../apps/web/README.md), [`apps/storybook/README.md`](../apps/storybook/README.md).

## Logging

Logging is **surface-specific**. One library does not fit service, browser, and CLI. Rule of thumb: **user-facing output ≠ operational logs**; only long-running Node services own a Pino pipeline.

| Surface | Kind | Mechanism | Destination |
|---|---|---|---|
| `apps/api`, `apps/worker` (+ Nest-like Node servers) | **Service** | Pino via `nestjs-pino` | stdout (JSON in prod) → Coolify/container log drain |
| `apps/web` (browser) | **Web client** | `console` in dev; structured **client reporter** optional later | DevTools; optional POST to API / third-party (Sentry etc.) — not Pino in the browser |
| `apps/docs` (Next.js) | **Hybrid** | **Server:** Pino (or Next-compatible structured logger); **Client:** same as web | Server → stdout; Client → DevTools / optional reporter |
| `tools/cli` | **CLI** | `@helloworld/terminal/log` — **tslog** + **ora**; stdout results / `--json` (no Pino) | Terminal / pipes / CI logs |
| `tools/tui` | **CLI-family** | UI toasts + `terminal/log` (**tslog**) for fatals on stderr | Terminal |
| `packages/api-client` | Library | No logger — do not log inside the SDK | Caller decides |
| `apps/mcp` | **Service** | Pino (HTTP MCP server) | stdout → Coolify/container log drain |

### 1. Service logging (`apps/api`, `apps/worker`, …)

Operational, structured, machine-consumable. Wire `nestjs-pino`: `LoggerModule.forRoot({ pinoHttp: … })`, inject with `@InjectPinoLogger(ServiceName.name)`.

| Setting | Intent |
|---|---|
| Level | Root `.env` `LOG_LEVEL` (default `info`) — one knob per process |
| Format (prod/QA) | JSON lines on **stdout** (12-factor; Coolify captures process logs) |
| Format (local) | `pino-pretty` (e.g. single-line) when `NODE_ENV !== "production"` |
| HTTP access logs | Prefer **off** or filter `/health` — avoid flood |
| Secrets | Never log tokens, API keys, cookies, raw auth headers |
| Errors | Log with context + correlate to HTTP response via exception filter; services still prefer `neverthrow` Results over throw-for-control-flow |

Bootstrap helper may live in `packages/modules` or each app’s `AppModule` — same pattern.

**Versions:** `pino` **10.3.1**, `nestjs-pino` **5.3.0**, `pino-pretty` **13.2.0** (dev).

### 2. Web application logging (`apps/web`, browser side of `apps/docs`)

The browser is not a log shipper for Pino.

| Layer | Intent |
|---|---|
| Local / dev | `console` (and React/Next error overlays) — enough while wiring |
| User-visible errors | UI state (toasts, inline messages) — not “logging” |
| Production client diagnostics | Optional later: error boundary → `reportError` / analytics / Sentry-class tool; **batch or sample**, never PII by default |
| Talking to the API | Failures surface in UI; do **not** duplicate every HTTP failure as a client “log pipeline” unless a product feature needs it |
| SSR / Next server (`apps/docs`) | Treat the **Node server** like a **Service** (structured logs to stdout). Keep that separate from browser `console` |

No `pino` dependency in browser bundles.

### 3. Command-line logging (`tools/cli`, and TUI as related)

CLIs keep **primary output clean**. Shared helpers: **`@helloworld/terminal/log`**.

| Piece | Choice | Role |
|---|---|---|
| Diagnostics | **tslog** **5.2.0** (`createLogger` / `log`) | Pretty levels → **stderr** (`pretty.levelMethod` → `console.error`) |
| Spinners | **ora** **9.4.1** (`spinner` / `withSpinner`) | Same **stderr** stream — safe to `log.*` while spinning |
| Results | `printResult` / `printJson` | **stdout** only (tables, text, `--json`) |
| Verbosity | `setVerbose` / `--verbose` | DEBUG vs INFO |
| Exit | `exitOk` / `exitError` | `0` / `1` |

**Do not** add Pino (or a rotating log file) to CLI/TUI. Service logs → api/worker (Coolify).

TUI: interactive feedback via toasts/overlays; unrecoverable errors may use `terminal/log` on stderr before exit.

Detail: [`packages/terminal/README.md`](../packages/terminal/README.md).

### Summary

```text
Service  →  Pino (+ pino-pretty locally) → stdout → platform logs
Web      →  UI + console / optional client reporter  (no Pino in browser)
CLI/TUI  →  tslog + ora (stderr) ; results on stdout   (via packages/terminal/log)
```

## Types pipeline (intent)

| Step | Tool | Role |
|---|---|---|
| Persistenz SoT | `schema.sql` → Entity Zod (`types` stage) | Table shapes in `packages/types/src/schema/` |
| API SoT | API Zod (`api` stage) | Create/Update/Response in `packages/types/src/api/` |
| Nest adapters | `nest_dto` stage | `createZodDto` under `apps/api/src/{resource}/dto/` |
| Typecheck | `tsc --noEmit` | Verifies the whole graph compiles; **does not** emit JS |
| Emit / bundle | per workspace — see [Build / emit contract](#build--emit-contract) | Produces `dist/` (or app bundler out); packages export built JS, not `src/` |
| OpenAPI | `@nestjs/swagger` + nestjs-zod | HTTP contract from API Zod / Nest DTOs |

`tsc --noEmit` is not a generator — it is the safety net after Zod (and any codegen) so wrong types fail in CI before ship. Wire it as a Turbo task (e.g. `typecheck`) across packages. Typecheck never substitutes for `build`.

## Build / emit contract

Classic Nest monorepo: every publishable TypeScript workspace **emits JavaScript to `dist/`**. Consumers import built output, not TypeScript source. Typecheck stays separate (`tsc --noEmit`).

| Workspace | `build` | Outputs | `package.json` exports | Notes |
|---|---|---|---|---|
| `packages/types` | `tsc` | `dist/**` | `./dist/…` (not `./src/…`) | Zod schemas + errors |
| `packages/modules` | `tsc` | `dist/**` | `./dist/…` + subpath exports | Nest infra |
| `packages/terminal` | `tsc` | `dist/**` | `./dist/…` (`config` / `log` / `tty`) | tools only |
| `packages/api-client` | `tsc` (after Orval) | `dist/**` | `./dist/…` | generate → then emit |
| `packages/config` | — | — | JSON/TS config files as today | tooling only, no app emit |
| `apps/api` | `nest build` | `dist/**` | — | Dev: `nest start --watch` (`@nestjs/cli`) |
| `apps/worker` | `nest build` (standalone) | `dist/**` | — | Same Nest emit as API; runnable `dist` |
| `tools/cli` | `tsc` | `dist/**` | bin → `dist/…` | No Nest CLI |
| `tools/tui` | `tsc` | `dist/**` | bin → `dist/…` | Ink/React entry |
| `apps/web` | `vite build` | Vite out (e.g. `dist/**`) | — | Not Nest; real emit for Coolify static/Node preview |
| `apps/docs` | `next build` | `.next/**` | — | Next host |
| `apps/storybook` | Storybook (`react-vite`) build | static out | — | Same Vite line as web |
| `apps/mcp` | `tsc` when scaffolded | `dist/**` | — | HTTP MCP server; no runtime TS source |

### Module / compiler rules (all TS workspaces)

- `"type": "module"`
- `moduleResolution`: `nodenext` — relative imports use `.js` suffixes
- Strict TypeScript; Nest apps/packages that use decorators: `experimentalDecorators` + `emitDecoratorMetadata`
- Root quality gate still: `format` → `lint` → `typecheck` → `test`; CI/deploy also runs `build` where images or bins need `dist`

### Docker / Coolify

Multi-stage images run **built** output only (e.g. Nest: `CMD ["node", "dist/main.js"]`). Build context = monorepo root so Turbo/`^build` compiles `packages/*` before the app runtime stage copies artefacts. Detail: [Coolify](#coolify-build-deploy-data-services).

### Scaffold status

Workspace `exports` today may still point at `./src/*.ts`. That is temporary — wiring must add per-package `build` scripts and flip `exports` to `dist/` to match this contract. Remove this note once the flip is done.

## Docs site (`apps/docs`)

| Piece | Choice | Role |
|---|---|---|
| Docs framework | Fumadocs (`fumadocs-core` / `fumadocs-ui` / `fumadocs-mdx`) | Page tree, theme, MDX pipeline, search UI |
| Host | **Next.js 16.3.8** (App Router) | Routing, `next dev` / `next build`, Coolify runtime image |
| Content source | repo `spec/` | Author specs in `spec/`; docs app only publishes |

Fumadocs is the docs layer; Next.js is the host app. Do not author durable product specs inside `apps/docs`.

Detail: [`apps/docs/README.md`](../apps/docs/README.md).

## Visual regression (Playwright + VRT)

| Piece | Where | Role |
|---|---|---|
| Playwright | this repo (`tests/e2e`) | Drives the app, takes screenshots |
| [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker) | **remote shared instance** (not deployed from this monorepo) | Stores baselines/diffs, review UI, multi-project |
| Agent / SDK | this repo (devDep when wired) | `@visual-regression-tracker/agent-playwright` **5.3.1** / `sdk-js` **5.7.1** — upload shots to VRT |

Provisioning the VRT server, projects, and API keys is **out of scope for this template** — tracked on the Development Automation todo list. Here we only record the choice and that helloworld will **attach** to that remote instance (env: API URL, project, API key).

Not embedded in `apps/docs`; docs may later link to the VRT review URL.

## Coolify (build, deploy, data services)

QA and production run on **Coolify**. Each long-running app ships its **own multi-stage Dockerfile**; Coolify builds the image on deploy from Git (Dockerfile build pack), then runs the container. Postgres and Garage stay Coolify one-click services — not custom app images.

| Piece | How | Role |
|---|---|---|
| [Coolify](https://coolify.io/) | remote instance | Hosts apps, Postgres, Garage for QA and production |
| Coolify CLI | local / agents (`coolify` **1.8.0**) | Create projects, apps, databases, one-click services; deploy via context in `spark/repo-profile.yaml` |
| App images | **one multi-stage `Dockerfile` per app** | Built by Coolify from the Git repo ([Dockerfile build pack](https://coolify.io/docs/applications/choose-deployment-method)) |
| PostgreSQL | `coolify database create postgresql` | One-click DB; prefer latest stable image (**18.6** as of 2026-10-01) |
| [Garage](https://garagehq.deuxfleurs.fr/) | Coolify one-click service | S3-compatible object store for `infra/s3` / app uploads |
| Better Auth | app code (`better-auth` + `@better-auth/api-key` **1.7.7**) | Sessions + managed API keys in `apps/api`; not a Coolify service |

### Docker / Coolify stage contract

Shared contract for every Coolify app image. Per-app Dockerfiles follow this shape; Deploy blurbs below point here. Emit rules: [Build / emit contract](#build--emit-contract).

| Decision | Choice | Notes |
|---|---|---|
| Install strategy | **`turbo prune --docker`** | Preferred for Nest apps (small context; matches Turbo). Fallback: filtered `pnpm deploy --filter <pkg>` if prune friction with workspace layout. Avoid full-root install in the runtime image. |
| Base image | **`node:26-alpine`** | Template default for build and runtime stages. Distroless-style later only if stricter runtime is required. |
| Health probe | **Coolify HTTP on `/health`** | Source of truth for QA/Prod. Dockerfile `HEALTHCHECK` is **optional** (useful for local `docker run` UX only — do not duplicate probes as a requirement). |
| Non-root user | **`nodeapp` UID/GID `1001`** | Create in the runtime stage; do not run as root. (`node` as username is acceptable only if it maps to the same UID.) |

**Multi-stage shape** (build context = **monorepo root**):

1. **Prune / deps** — `turbo prune --docker --scope=<app-package>` (or equivalent filter) → copy pruned lockfile + workspace manifests → `pnpm install --frozen-lockfile` (layer cache).
2. **Builder** — `pnpm` / Turbo **build** for the app (`dependsOn: ["^build"]` → workspace `packages/*` emit `dist/**` before the app).
3. **Runtime** — `FROM node:26-alpine`; copy only built artefacts + production node_modules needed to run; `USER nodeapp` (UID 1001); expose the app port; `CMD` runs built JS only (Nest: `node dist/main.js`).

```dockerfile
# Runtime stage sketch (Nest API) — adapt WORKDIR / CMD per app
FROM node:26-alpine AS production
RUN addgroup -g 1001 nodeapp && adduser -u 1001 -G nodeapp -s /bin/sh -D nodeapp
WORKDIR /app/apps/api
USER nodeapp
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Coolify app = one Git source + Dockerfile path (+ base directory if required); same repo, different Dockerfile per service. Default deploy path: **build on Coolify from Dockerfile**. Optional later: CI push to a registry and Coolify **Docker Image** deploy (pull-only) — not the default.

### Docker images (per app)

Each row’s Deploy intent follows the [stage contract](#docker--coolify-stage-contract) above.

| App | Dockerfile (intent) | Coolify | Deploy |
|---|---|---|---|
| `apps/api` | `apps/api/Dockerfile` | Application | Nest API; monorepo-root context; prune/build → `node dist/main.js` as `nodeapp` — [stage contract](#docker--coolify-stage-contract) |
| `apps/worker` | `apps/worker/Dockerfile` | Application | Background jobs; same prune/build/runtime pattern — [stage contract](#docker--coolify-stage-contract) |
| `apps/web` | `apps/web/Dockerfile` | Application | React + Vite frontend; same contract (Vite out instead of Nest `dist/main.js`) — [stage contract](#docker--coolify-stage-contract) |
| `apps/docs` | `apps/docs/Dockerfile` | Application | Fumadocs + Next.js; same contract (`.next` runtime) — [stage contract](#docker--coolify-stage-contract) |
| `apps/storybook` | `apps/storybook/Dockerfile` | Application | UI gallery; same contract (static/Storybook out) — [stage contract](#docker--coolify-stage-contract) |
| `apps/mcp` | `apps/mcp/Dockerfile` | Application | MCP server; monorepo-root context if shared packages needed — [stage contract](#docker--coolify-stage-contract) |
| `tools/cli`, `tools/tui` | — | **not** deployed | Installable clients only |
| Postgres / Garage | Coolify service images | Database / service | No custom Dockerfile in this repo |

**Local data services:** Compose stand-ins under `infra/` (Postgres, MinIO-compatible S3) — not the QA/Prod topology. Intent scripts from root: `pnpm run docker:local:up` / `docker:local:down` (or `docker compose up -d postgres s3` until those aliases exist). Details: [`infra/postgres/README.md`](../infra/postgres/README.md), [`infra/s3/README.md`](../infra/s3/README.md).

App processes for local dev start from the repo root (`pnpm`); Dockerfiles are primarily for Coolify (and optional local image smoke tests).

UUIDs, instance URL, and CLI context stay in `spark/repo-profile.yaml` (and local CLI config) — never commit API tokens.

**Local env:** one repo-root `.env` only — see [Root environment](#root-environment).

## Auth (Better Auth)

| Piece | Package / place | Role |
|---|---|---|
| Core | `better-auth` **1.7.7** | Framework-agnostic auth; wire in `apps/api` (+ web client for sessions) |
| API keys | `@better-auth/api-key` **1.7.7** | Create/manage/verify keys for CLI, TUI, automation — [plugin docs](https://www.better-auth.com/docs/plugins/api-key) |
| Nest adapter | `packages/modules` `auth/` | Guard(s): session cookie and/or API key header → `verifyApiKey` |
| Clients | `packages/api-client` + tools | Key from `@helloworld/terminal/config` (header name TBD when wiring, often `x-api-key`) |
| Public routes | `@Public()` | Opt out of global auth guard (e.g. `GET /health`, auth bootstrap routes as needed) |

Not a static env-only global key like a lone `ApiKeyModule` — keys are managed entities (user/org, permissions, optional rate limits). Session auth (web) and API-key auth (machines) run in parallel.

## Zod ↔ OpenAPI

Layered SoT (not a single file):

| Layer | Location | How |
|---|---|---|
| Persistenz / Entity | `packages/types/src/schema/` | Generator **types** stage from `schema.sql` |
| API contracts | `packages/types/src/api/` | Generator **api** stage (Create / Update / Response from entity) |
| Nest DTO classes | `apps/api/src/{resource}/dto/` | Generator **nest_dto** stage — `createZodDto(...)` only |
| OpenAPI document | Nest + **nestjs-zod** + `@nestjs/swagger` | Build export → `openapi.json` (and optional Swagger UI at runtime) |
| Client SDK | **Orval** + ky mutator | `openapi.json` → `packages/api-client/src/generated/` |

Bridge choice: **nestjs-zod** — `createZodDto` (generated Nest DTOs), global **`ZodValidationPipe`** in `main.ts`, and **`cleanupOpenApiDoc`** when exporting / serving OpenAPI so Zod-shaped schemas stay valid for Swagger/Orval. API Zod stays in `@helloworld/types/api`; Nest files are thin generated wrappers; Orval consumes the exported OpenAPI — no second hand-written client.

## Testing (intent)

| Layer | Tool | Where |
|---|---|---|
| Unit | Vitest (+ SWC for Nest decorators via `packages/config`) | Next to code under `apps/` / `packages/` / `tools/`. Pin **`unplugin-swc` 2.0.0** (npm latest as of 2026-10-08) only if tech-stack **#8** (GH [#15](https://github.com/einmalik1/helloworld/issues/15)) selects SWC for Vitest/Nest |
| Nest module | `@nestjs/testing` | Controllers/services isolated; mock `DatabaseService` / externals |
| HTTP | **supertest** | Nest app bootstrap or running API — `apps/api` unit-ish + `tests/api` suite |
| E2E / visual | Playwright (+ VRT agent) | `tests/e2e` |

Root quality gate (when wired): `format` → `lint` → `typecheck` → `test`. Suite prerequisites: [`tests/README.md`](../tests/README.md).

## Schema generators (`spark/generators/`)

Python + Jinja2 codegen driven by [`spark/repo-profile.yaml`](../spark/repo-profile.yaml) `generators:`. Python deps live in `spark/generators/.venv` — **outside** npm; rule: [Root dependencies](#root-dependencies).

| Stage | Role |
|---|---|
| core | `schema.sql` → `schema-model.json` (categories from profile) |
| erd | JSON → Mermaid, draw.io, `erd.html` |
| docs | JSON → Markdown catalog under `generated/docs/` |
| types | JSON → Entity Zod → `packages/types/src/schema/` (+ artifact under `spec/erd/generated/types/`) |
| api | Entity Zod → Create/Update/Response → `packages/types/src/api/` |
| nest_dto | API Zod → `createZodDto` classes → `apps/api/src/{resource}/dto/` |

**API Create omit:** PK-with-default + `generators.api.create_omit_columns` (default `created_at`, `updated_at`). Update = Create.partial(). Response = entity schema.

Run: `pnpm generate` (full) or `pnpm generate:<stage>`. Detail: [`spark/generators/README.md`](../spark/generators/README.md).

## Out of scope here

- Domain vocabulary → root `CONTEXT.md`
- Feature behaviour → `spec/features/`
- Nest controller/service/filter detail → [`apps/api/README.md`](../apps/api/README.md#nestjs-conventions)
- Module contracts → [`packages/modules/README.md`](../packages/modules/README.md)
- Other component wiring → each app/tool README
