## ADDED Requirements

### Requirement: Vite React SPA shell

`apps/web` MUST be a Vite + React application (tech-stack pins) that starts on the configured web port (`WEB_PORT` / default `5173`) and builds with `vite build` into Vite output under the web package.

#### Scenario: Dev and build scripts exist

- **WHEN** a developer inspects `@helloworld/web` `package.json`
- **THEN** it exposes `dev` (Vite), `build` (`vite build`), and `typecheck` scripts

#### Scenario: Build emits static assets

- **WHEN** a developer runs `pnpm --filter @helloworld/web build`
- **THEN** the package writes Vite build output (e.g. `dist/`) without requiring Nest `dist/main.js`

### Requirement: Root env only for public URLs

The web app MUST read public API and chat base URLs from the repository root env (`PUBLIC_API_URL`, `PUBLIC_CHAT_URL`) via Vite `envPrefix` / define — not from an `apps/web/.env` as the primary config source.

#### Scenario: No app-local env as SoT

- **WHEN** the shell is configured for local development
- **THEN** public base URLs resolve from root `.env` / process env, and the app does not require a committed `apps/web/.env`

### Requirement: Cookie session auth to apps/api

Browser authentication MUST use Better Auth session cookies against `apps/api`. The web package MUST NOT depend on `@helloworld/terminal` and MUST NOT use a static global `API_KEY` as the product credential.

#### Scenario: Session client targets API origin

- **WHEN** the shell initializes its auth client
- **THEN** the Better Auth client base URL is the public API origin (`PUBLIC_API_URL` / equivalent), not a vendor or chat LLM URL

### Requirement: Chat UI calls apps/chat only

Any chat UI in `apps/web` (static interim page or SPA route) MUST call `PUBLIC_CHAT_URL` / `apps/chat` HTTP only. The browser MUST NOT embed LLM provider SDKs or call vendor LLM URLs.

#### Scenario: Chat entry uses chat service URL

- **WHEN** a user opens the web chat entry
- **THEN** requests go to the configured chat service origin, not to OpenAI/Anthropic or similar provider endpoints

### Requirement: Typed API via api-client

Product domain HTTP from the web shell MUST use `@helloworld/api-client` when calling `apps/api` product routes. The web app MUST configure the client with the public API URL and cookie credentials (`credentials: "include"` or equivalent), not `packages/terminal` key resolution.

#### Scenario: Web does not import terminal config

- **WHEN** `apps/web` depends on `@helloworld/api-client`
- **THEN** it does not import `@helloworld/terminal` for URL/key resolution
