# Tech stack

Chosen technologies for Hello World. Keep this inventory factual.

Architecture (components and boundaries) stays technology-agnostic in [`architecture.md`](architecture.md).  
Rationale for contested choices lives in [`decisions/`](decisions/).

Versions below are the latest published on npm as of 2026-10-01 (pin in lockfile when wiring packages).

## Inventory

| Area | Choice | Version | Notes |
|---|---|---|---|
| Package manager | pnpm | 12.8.1 | Workspace + lockfile `pnpm-lock.yaml` |
| Language | TypeScript | 7.0.2 | Across the monorepo |
| Typecheck | `tsc --noEmit` | (via typescript) | CI/local gate: typecheck only, no JS emit — see below |
| Runtime | Node.js | 26 | Current line (local 26.7.0); pin exact patch in `.nvmrc` / CI when wiring |
| Monorepo tooling | Turborepo | 2.11.6 | `turbo` — builds/tasks across the workspace |
| Validation / type SoT | Zod | 4.6.5 | Schemas as source of truth; TS types derived — see OpenAPI note below |
| Service errors | neverthrow | 8.2.0 | Result types instead of thrown errors in the service layer |
| Logging | by surface | — | **Service** = Pino (+ pino-pretty local); **Web** = console/reporter; **CLI/TUI** = tslog + ora via `packages/terminal/log` |
| Web (`apps/web`) | React | 19.3.0 | `react` / `react-dom`; bundler TBD |
| API (`apps/api`) | NestJS | 12.x | Express adapter + modules below |
| Worker (`apps/worker`) | | | |
| Docs site (`apps/docs`) | Fumadocs on Next.js | fumadocs core/ui 16.15.17, mdx 15.4.5; **next 16.3.8** | [Fumadocs](https://github.com/fuma-nama/fumadocs) UI/MDX; host **Next.js** (App Router) — publishes `spec/` |
| Storybook (`apps/storybook`) | Storybook | 10.6.1 | UI component gallery |
| MCP (`apps/mcp`) | | | |
| CLI (`tools/cli`) | Commander | 15.0.0 | Non-interactive terminal client; HTTP via `ky` — see Terminal clients below |
| TUI (`tools/tui`) | Ink + React | ink 7.1.1, react 19.3.0 | Interactive terminal UI; same API surface via `ky` — separate binary from CLI |
| HTTP client (cli/tui) | ky | 2.1.0 | Thin REST client toward `apps/api` / `apps/worker` |
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
| Shared libs (`packages/`) | types / modules / config / api-client / terminal | planned | See Shared packages below — not scaffolded yet |

## Shared packages (`packages/`)

Planned workspace libraries — directories scaffolded under `packages/*`; implementation not wired yet. Apps and tools consume these as workspace deps. Further module-level detail lands in each package README when implemented.

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
| OpenAPI | `setupOpenApi(app, options)` — Swagger UI + JSON export from shared setup |
| Logging (optional shared) | nestjs-pino `LoggerModule` bootstrap helper if extracted from apps |

### `packages/api-client`

Typed **client SDK** for consumers of the REST surfaces. Transport is **ky**; this package is the typed layer on top — not “ky with extras dumped in the tools”.

| Area | Intent |
|---|---|
| Targets | `apps/api` and `apps/worker` (two base URLs / environments) |
| API shape | Methods such as `client.health()`, domain resources as features land — no parallel DTO shapes |
| Types / validation | Request/response via Zod schemas from `packages/types` (`z.infer`) |
| Auth | Send Better Auth API key (or session credential) from local config — header/wiring TBD |
| Errors | Map HTTP failures to shared error classes from `packages/types` where useful |
| Not in scope | NestJS, DB, Ink, Commander, Pino |

**MCP:** not over this REST client. `apps/mcp` stays MCP protocol; share **domain types** from `packages/types` only — separate transport/SDK for MCP consumers.

**Consumers:** `tools/cli`, `tools/tui`, optionally `apps/web`. Tools should call the SDK, not raw ky (except thin wiring inside this package). Web may use `api-client` with session/cookies — it does **not** use `packages/terminal`.

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

Workspaces extend these bases (e.g. `"extends": "@helloworld/config/tsconfig"` — exact package name TBD when scaffolding).

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
| `@nestjs/schedule` | 12.0.2 | Scheduler infrastructure (optional, e.g. cron) |
| `@nestjs/testing` | 12.1.2 | Test modules (dev) |
| `nestjs-pino` | 5.3.0 | Nest logger integration — `LoggerModule` + `@InjectPinoLogger` |
| `pino` | 10.3.1 | Underlying logger (via nestjs-pino) |
| `pino-pretty` | (dev) | Human-readable logs outside production |

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
| `apps/mcp` | TBD | If long-running Node server → **Service** rules; if thin stdio bridge → **CLI** rules | — |

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

**Versions:** `pino` **10.3.1**, `nestjs-pino` **5.3.0**, `pino-pretty` (dev).

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
| Schema SoT | Zod | Runtime validation + inferred TypeScript types |
| Typecheck | `tsc --noEmit` | Verifies the whole graph compiles; **does not** emit JS |
| Emit / bundle | App bundler / Nest build (TBD per package) | Produces runnable output |
| OpenAPI | `@nestjs/swagger` (+ Zod bridge, TBD) | HTTP contract + endpoint docs |

`tsc --noEmit` is not a generator — it is the safety net after Zod (and any codegen) so wrong types fail in CI before ship. Wire it as a Turbo task (e.g. `typecheck`) across packages.

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

### Docker images (per app)

| App | Dockerfile (intent) | Coolify | Notes |
|---|---|---|---|
| `apps/api` | `apps/api/Dockerfile` | Application | Nest API; build context = **monorepo root** (needs `packages/*`) |
| `apps/worker` | `apps/worker/Dockerfile` | Application | Background jobs; same monorepo context pattern |
| `apps/web` | `apps/web/Dockerfile` | Application | React frontend |
| `apps/docs` | `apps/docs/Dockerfile` | Application | Fumadocs + Next.js docs site |
| `apps/storybook` | `apps/storybook/Dockerfile` | Application | UI gallery |
| `apps/mcp` | `apps/mcp/Dockerfile` | Application | MCP server |
| `tools/cli`, `tools/tui` | — | **not** deployed | Installable clients only |
| Postgres / Garage | Coolify service images | Database / service | No custom Dockerfile in this repo |

**Build contract (intent):**

- Multi-stage: deps → build → slim runtime (e.g. Node 26 alpine / distroless-style as chosen when wiring)
- Coolify app = one Git source + Dockerfile path (+ base directory if required); same repo, different Dockerfile per service
- Optional later: CI push to a registry and Coolify **Docker Image** deploy (pull-only) — not the default path; default is **build on Coolify from Dockerfile**

**Local:** Compose stand-ins under `infra/` for Postgres / S3-compatible storage — not the QA/Prod topology. App processes for local dev still start from the repo root (`pnpm`); Dockerfiles are primarily for Coolify (and optional local image smoke tests).

UUIDs, instance URL, and CLI context stay in `spark/repo-profile.yaml` (and local CLI config) — never commit API tokens.

**Local env:** one repo-root `.env` (from `.env.example`), sections sorted by service — not per-app env files. Start processes from the repo root.

## Auth (Better Auth)

| Piece | Package / place | Role |
|---|---|---|
| Core | `better-auth` **1.7.7** | Framework-agnostic auth; wire in `apps/api` (+ web client for sessions) |
| API keys | `@better-auth/api-key` **1.7.7** | Create/manage/verify keys for CLI, TUI, automation — [plugin docs](https://www.better-auth.com/docs/plugins/api-key) |
| Nest adapter | `packages/modules` `auth/` | Guard(s): session cookie and/or API key header → `verifyApiKey` |
| Clients | `packages/api-client` + tools | Key from `@helloworld/terminal/config` (header name TBD when wiring, often `x-api-key`) |

Not a static env-only global key like a lone `ApiKeyModule` — keys are managed entities (user/org, permissions, optional rate limits). Session auth (web) and API-key auth (machines) run in parallel.

## Zod ↔ OpenAPI (open)

Intent: **Zod** remains the type / validation source of truth, and the API still exposes **OpenAPI** (via `@nestjs/swagger`) at the REST layer — including generated docs for consumers.

Exact bridge (Zod → OpenAPI schema without duplicating DTOs) is still to decide when wiring `apps/api` (e.g. nestjs-zod / zod-to-openapi style helpers vs. decorator-generated Swagger from shared Zod schemas). Goal: one schema definition, not parallel class-validator DTOs and Zod.

## Out of scope here

- Domain vocabulary → root `CONTEXT.md`
- Feature behaviour → `spec/features/`
- Component wiring details → each app/tool README once the stack lands
