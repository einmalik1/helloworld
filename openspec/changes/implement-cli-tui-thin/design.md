## Context

`tools/cli` / `tools/tui` are README-only. `packages/terminal` has working `log` but empty `config` / `tty`. `packages/api-client` is an empty scaffold (Orval generate skips without `openapi.json`). Ticket `#51` / backlog `implement-cli-tui-thin`: Commander/Ink against api-client; prefer `#41` auth header; do not re-open ADRs 0001–0006.

In-force ADRs reviewed: 0001–0008 (facade + chat). Auth keys for tools are Better Auth managed API keys in XDG config (ADR 0003) — not root `.env` `API_KEY`.

## Goals / Non-Goals

**Goals:**

- Implement terminal `config` + `tty`, api-client ky mutator, and thin CLI/TUI packages per tech-stack / component READMEs.
- Baseline ops: CLI `health` + `config *`; TUI shell with health + local settings; Vitest smoke without Coolify.
- Pin deps at tech-stack versions (Commander 15, Ink 7, React 19, ky 2.1, env-paths 4, zod).

**Non-Goals:**

- Domain CRUD commands/tabs (person/channel/greeting/…).
- Full Orval generation from OpenAPI (keep skip-until-export; hand mutator is enough for health).
- Coolify deploy of CLI/TUI (installable clients, not deployed apps).
- Re-opening ADRs 0001–0006; Better Auth issue/revoke UX (`#41`).

## Decisions

1. **Terminal config** (`packages/terminal`):
   - Deps: `zod`, `env-paths@4.0.0`.
   - Defaults: `apiUrl=http://localhost:3000`, `workerUrl=http://localhost:3001`, `environment=local`, `pollInterval=30`, `pageSize=15`.
   - API: `loadConfig`, `saveConfig`, `resolveEnvironment(config, override?)`, `overrideEnvironment` helper for CLI `--env`.
   - Path: `join(envPaths('helloworld').config, 'config.json')`.

2. **TTY** (`packages/terminal/tty`):
   - `isInteractiveTTY()`, `requireInteractiveTTY(hint)` — TUI entry calls require; non-TTY → stderr hint + exit 1.

3. **api-client HTTP**:
   - Port `#41`-aligned mutator: `configureClient` / `customFetch` / `fetchHealth` / `x-api-key`.
   - Use ky option name supported by ky **2.1** (`prefix` or `prefixUrl` — verify at install).
   - Package smoke: local http server asserts header behavior (same pattern as `#41` worktree).

4. **CLI layout** matches README: `bin/run.js` → `dist/cli.js`; commands under `src/commands/`; thin `api.ts` / `config.ts` wiring modules.
   - `health`: resolve env → `configureClient` for api + separate ky/fetchHealth for worker base URL (worker may not share api prefix) — use two short-lived clients or call `fetch` with timeout 3s for worker.
   - Decision: export a small `createHealthClient(baseUrl, apiKey?)` or call `configureClient` twice sequentially; prefer **`fetchHealthAt(baseUrl, apiKey?)`** helper that does not mutate the global client, OR configure once for api and probe worker with ky.create inline in CLI. Keep api-client global for Orval; CLI health aggregation may use `fetchHealth` after `configureClient` for api and a one-off ky for worker.

5. **TUI layout** matches README: `main.tsx` TTY check → render `<App />`; tabs Status (health) + Settings (config); Ink alternate screen; no Commander.

6. **Verification gate:**
   - `pnpm --filter @helloworld/terminal typecheck && build`
   - `pnpm --filter @helloworld/api-client typecheck && build && smoke`
   - `pnpm --filter cli typecheck && build && smoke`
   - `pnpm --filter tui typecheck && build && smoke`
   - CLI smoke: config list against temp `XDG_CONFIG_HOME`; health may mock fetch or skip live services.
   - TUI smoke: non-TTY entry exits 1 with CLI hint (spawn bin).

## Risks / Trade-offs

- **[Risk] Worker not listening / no WORKER_PORT in .env** → Mitigation: default URL documented; health reports per-target failure without crashing config path.
- **[Risk] ky 2 option rename** → Mitigation: verify against installed ky types in this change.
- **[Trade-off] Hand mutator before Orval** → Acceptable; generate still skips; tools need health now.
- **[Risk] Ink/React ESM + tsc** → Mitigation: `"jsx": "react-jsx"`, `"type": "module"`, bin shim.

## Migration Plan

1. Land packages + tools on automation branch; merge via PR.
2. Later tickets add domain commands/tabs using the same wiring.
3. Rollback: remove tools package sources / revert terminal+api-client wiring; no SQL.

## Open Questions

- None blocking. Domain surfaces wait for Wave B APIs.
