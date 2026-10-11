## 1. Terminal toolkit (config + tty)

- [x] 1.1 Add `zod` + `env-paths@4.0.0` to `@helloworld/terminal`; implement `@helloworld/terminal/config` (schema, load/save, resolve, CLI env override) per README normative keys
- [x] 1.2 Implement `@helloworld/terminal/tty` (`isInteractiveTTY`, `requireInteractiveTTY`); typecheck + build `@helloworld/terminal`

## 2. API client mutator

- [x] 2.1 Add `ky@2.1.0` and implement `src/http.ts` + exports (`configureClient`, `customFetch`, `fetchHealth`, timeouts, `x-api-key`)
- [x] 2.2 Add api-client HTTP smoke (header on/off); typecheck + build + smoke `@helloworld/api-client`

## 3. CLI thin client

- [x] 3.1 Scaffold `tools/cli` package (`helloworld` bin, Commander 15, deps on terminal + api-client, tsc emit)
- [x] 3.2 Implement global `--env` / `--json`, `health`, and `config list|set|unset|env` commands via thin wiring modules
- [x] 3.3 Add CLI Vitest smoke (config path via temp XDG); typecheck + build + smoke `cli`

## 4. TUI thin client

- [x] 4.1 Scaffold `tools/tui` package (`helloworld-tui` bin, Ink 7 + React 19, deps on terminal + api-client, tsc emit)
- [x] 4.2 Implement TTY gate, App shell with health + settings/config surfaces (no Commander)
- [x] 4.3 Add TUI Vitest smoke (non-TTY exit hint); typecheck + build + smoke `tui`

## 5. Docs / integration

- [x] 5.1 Align `tools/cli` / `tools/tui` / `packages/terminal` / `packages/api-client` READMEs if wiring details drifted
- [x] 5.2 Run format + lint + targeted typecheck/build/smoke for touched packages; fix until green
