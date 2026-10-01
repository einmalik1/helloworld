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
| Logging | Pino | 10.3.1 | Structured logging |
| Web (`apps/web`) | React | 19.3.0 | `react` / `react-dom`; bundler TBD |
| API (`apps/api`) | NestJS | 12.x | Express adapter + modules below |
| Worker (`apps/worker`) | | | |
| Docs site (`apps/docs`) | Fumadocs | core/ui 16.15.17, mdx 15.4.5 | [fuma-nama/fumadocs](https://github.com/fuma-nama/fumadocs); host framework TBD (Next.js / Vite / Astro) |
| Storybook (`apps/storybook`) | Storybook | 10.6.1 | UI component gallery |
| MCP (`apps/mcp`) | | | |
| CLI (`tools/cli`) | Commander | 15.0.0 | Non-interactive terminal client; HTTP via `ky` — see Terminal clients below |
| TUI (`tools/tui`) | Ink + React | ink 7.1.1, react 19.3.0 | Interactive terminal UI; same API surface via `ky` — separate binary from CLI |
| HTTP client (cli/tui) | ky | 2.1.0 | Thin REST client toward `apps/api` / `apps/worker` |
| TUI text input | `ink-text-input` | 6.0.0 | Editable fields in Ink overlays |
| ORM | Drizzle | orm 0.45.3, kit 0.31.11 | `drizzle-orm` + `drizzle-kit` |
| Database | PostgreSQL | 18.6 | Coolify one-click (`coolify database create postgresql`); pin image via `--image` when provisioning — see below |
| Object storage | Garage | Coolify service | S3-compatible; Coolify one-click Garage ([docs](https://coolify.io/docs/services/garage)); app client `@aws-sdk/client-s3` **3.1144.0** |
| Auth | Better Auth | 1.7.7 | `better-auth` — framework-agnostic TS auth; wire in `apps/api` (+ web client) |
| Lint | Oxlint | 1.86.0 | `oxlint` |
| Format | Oxfmt | 0.71.0 | `oxfmt` (Oxformat) |
| Unit tests | Vitest | 5.0.3 | |
| E2E | Playwright | 1.63.0 | `@playwright/test` — `tests/e2e` |
| Visual regression | Visual Regression Tracker | remote | Self-hosted **outside** this repo; this app only connects — see below |
| Deploy | Coolify | CLI 1.8.0 | Projects / QA+Prod via Coolify CLI; targets in `spark/repo-profile.yaml` — see below |
| Shared libs (`packages/`) | types / modules / config / api-client | scaffolded | See Shared packages below — dirs present; implementation not wired |

## Shared packages (`packages/`)

Workspace libraries — directories scaffolded under `packages/*`; implementation not wired yet. Apps and tools consume these as workspace deps. Further module-level detail lands in each package README when implemented.

Dependency direction (bottom → top):

```text
packages/config          # tooling only — no app deps
       ↑
packages/types           # zod only
       ↑
       ├── packages/modules      # types + NestJS + Drizzle + …  →  apps/api
       │
       └── packages/api-client   # types + ky  →  tools/cli, tools/tui, (optional apps/web)
```

| Package | Role | Runtime deps (intent) |
|---|---|---|
| `packages/types` | Domain Zod schemas, inferred TS types, shared error classes — no Nest/DB/services | `zod` |
| `packages/modules` | Reusable NestJS infrastructure modules for `apps/api` (and other Nest apps) | NestJS, Drizzle, postgres.js, Zod, neverthrow, `packages/types` |
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
| Auth | Better Auth wiring for Nest (sessions/users against Postgres) — not API-key-only |
| OpenAPI | `setupOpenApi(app, options)` — Swagger UI + JSON export from shared setup |

### `packages/api-client`

Typed **client SDK** for consumers of the REST surfaces. Transport is **ky**; this package is the typed layer on top — not “ky with extras dumped in the tools”.

| Area | Intent |
|---|---|
| Targets | `apps/api` and `apps/worker` (two base URLs / environments) |
| API shape | Methods such as `client.health()`, domain resources as features land — no parallel DTO shapes |
| Types / validation | Request/response via Zod schemas from `packages/types` (`z.infer`) |
| Auth | Hook for credentials required by Better Auth / API — flow TBD when wiring |
| Errors | Map HTTP failures to shared error classes from `packages/types` where useful |
| Not in scope | NestJS, DB, Ink, Commander, Pino |

**MCP:** not over this REST client. `apps/mcp` stays MCP protocol; share **domain types** from `packages/types` only — separate transport/SDK for MCP consumers.

**Consumers:** `tools/cli`, `tools/tui`, optionally `apps/web`. Tools should call the SDK, not raw ky (except thin wiring inside this package).

### `packages/config`

| Export | File (intent) | Purpose |
|---|---|---|
| tsconfig | `tsconfig.base.json` | Strict TS, ESM, decorators, `nodenext` |
| vitest | `vitest.config.ts` | Shared Vitest base (SWC/decorators as needed) |
| oxlint | `oxlintrc.json` | Shared lint rules |

Workspaces extend these bases when the files exist (e.g. `"extends": "@helloworld/config/tsconfig"`).

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
| Role | Thin clients for `apps/api` + `apps/worker` | No NestJS, no DB, no Pino stack; HTTP via `packages/api-client` |
| HTTP | `packages/api-client` (ky underneath) | Tools do not own raw endpoint URLs long-term |
| Types | `packages/types` (via api-client) | No parallel domain shapes in the tools |
| Config validation | Zod | Local config file — not server env-bootstrap |
| Config path | `$XDG_CONFIG_HOME/helloworld/config.json` (fallback `~/.config/helloworld/config.json`) | Environments e.g. `local` \| `dev` \| `prod` |
| Quality | Vitest + oxlint/oxfmt via `packages/config` | Unit tests under each tool |
| Auth to API | Credentials as required by Better Auth / API — exact client flow TBD when wiring | Store per-environment in local config; never commit secrets |

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

## Types pipeline (intent)

| Step | Tool | Role |
|---|---|---|
| Schema SoT | Zod | Runtime validation + inferred TypeScript types |
| Typecheck | `tsc --noEmit` | Verifies the whole graph compiles; **does not** emit JS |
| Emit / bundle | App bundler / Nest build (TBD per package) | Produces runnable output |
| OpenAPI | `@nestjs/swagger` (+ Zod bridge, TBD) | HTTP contract + endpoint docs |

`tsc --noEmit` is not a generator — it is the safety net after Zod (and any codegen) so wrong types fail in CI before ship. Wire it as a Turbo task (e.g. `typecheck`) across packages.

## Visual regression (Playwright + VRT)

| Piece | Where | Role |
|---|---|---|
| Playwright | this repo (`tests/e2e`) | Drives the app, takes screenshots |
| [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker) | **remote shared instance** (not deployed from this monorepo) | Stores baselines/diffs, review UI, multi-project |
| Agent / SDK | this repo (devDep when wired) | `@visual-regression-tracker/agent-playwright` **5.3.1** / `sdk-js` **5.7.1** — upload shots to VRT |

Provisioning the VRT server, projects, and API keys is **out of scope for this template** — tracked on the Development Automation todo list. Here we only record the choice and that helloworld will **attach** to that remote instance (env: API URL, project, API key).

Not embedded in `apps/docs`; docs may later link to the VRT review URL.

## Coolify (build, deploy, data services)

| Piece | How | Role |
|---|---|---|
| [Coolify](https://coolify.io/) | remote instance | Hosts apps, Postgres, Garage for QA and production |
| Coolify CLI | local / agents (`coolify` **1.8.0**) | Create projects, apps, databases, one-click services; deploy via context in `spark/repo-profile.yaml` |
| PostgreSQL | `coolify database create postgresql` | One-click DB; prefer latest stable image (**18.6** as of 2026-10-01) |
| [Garage](https://garagehq.deuxfleurs.fr/) | Coolify one-click service | S3-compatible object store for `infra/s3` / app uploads |
| Better Auth | app code (`better-auth` **1.7.7**) | Authn/authz in `apps/api` (sessions/users against Postgres); not a Coolify service |

UUIDs, instance URL, and CLI context stay in `spark/repo-profile.yaml` (and local CLI config) — never commit API tokens. Local/dev may use Compose stand-ins under `infra/` (e.g. MinIO-compatible for S3); prod/QA use Coolify-provisioned Postgres + Garage.

**Local env:** one repo-root `.env` (from `.env.example`), sections sorted by service — not per-app env files. Start processes from the repo root.

## Zod ↔ OpenAPI (open)

Intent: **Zod** remains the type / validation source of truth, and the API still exposes **OpenAPI** (via `@nestjs/swagger`) at the REST layer — including generated docs for consumers.

Exact bridge (Zod → OpenAPI schema without duplicating DTOs) is still to decide when wiring `apps/api` (e.g. nestjs-zod / zod-to-openapi style helpers vs. decorator-generated Swagger from shared Zod schemas). Goal: one schema definition, not parallel class-validator DTOs and Zod.

## Out of scope here

- Domain vocabulary → root `CONTEXT.md`
- Feature behaviour → `spec/features/`
- Component wiring details → each app/tool README once the stack lands
