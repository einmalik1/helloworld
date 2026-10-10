# api-client

Typed REST SDK for `apps/api` (and later `apps/worker`). **Orval** generates the client from OpenAPI; **ky** is the transport via a hand-written mutator.

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesapi-client).  
Build: Orval into `src/generated/` → then `tsc` → `dist/` — [`Build / emit contract`](../../openspec/tech-stack.md#build--emit-contract).

**Not** for MCP — share domain types only; MCP stays its own protocol.

## Pipeline

```text
pnpm generate:code     # SQL → ERD/docs/Zod/Nest DTOs
     ↓
openapi:export         # Nest → apps/api/openapi.json (when api wired)
     ↓
pnpm generate:client   # Orval → src/generated/  (skips if no openapi.json)
```

Root shortcut: **`pnpm generate`** runs `generate:code` then `generate:client`.

```bash
pnpm generate
# single stages:
pnpm generate:client
pnpm --filter @helloworld/api-client generate
```

## Layout (intent)

```text
packages/api-client/
├── orval.config.ts          # input openapi.json, output generated/, mutator path
├── scripts/generate.mjs     # skip-or-run Orval
├── package.json             # scripts.generate
├── src/
│   ├── generated/           # Orval output only — never hand-edit
│   ├── http.ts              # ky mutator (hand)
│   └── index.ts             # public exports / facade (hand)
└── README.md
```

## Orval config (sketch)

```ts
// packages/api-client/orval.config.ts
import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "../../apps/api/openapi.json",
    output: {
      mode: "tags-split",
      target: "./src/generated/api.ts",
      schemas: "./src/generated/models",
      client: "fetch",
      override: {
        mutator: {
          path: "./src/http.ts",
          name: "customFetch",
        },
      },
    },
  },
});
```

## Timeouts (normative)

ky timeouts for the hand-written mutator in `src/http.ts`:

| Call class | Timeout | Notes |
|---|---|---|
| General (default client) | **30s** (`30_000` ms) | All Orval-generated calls and normal SDK usage |
| Health probes | **3s** (`3_000` ms) | `GET /health` (and CLI/TUI aggregation of api + worker). Per-request override — do not lower the default client timeout |

Stack: ky **2.1**. Consumers that need a different budget pass `timeout` on that request only.

## ky mutator

Hand-written in [`src/http.ts`](src/http.ts): `configureClient`, `customFetch` (Orval mutator), `fetchHealth`. Exports from package root.

## Auth header / `configureClient`

Frozen mutator contract for machine clients (CLI/TUI/MCP-style callers). Nest verifies with Better Auth `verifyApiKey`. Spec: [`tech-stack.md` § Auth](../../spec/tech-stack.md#auth-better-auth).

| Rule | Contract |
|---|---|
| Header name | **`x-api-key`** — frozen; do not invent `Authorization: Bearer` for API keys in v1 |
| Options | `configureClient({ apiUrl, apiKey? })` — see sketch above |
| When `apiKey` set | Mutator sets `request.headers.set("x-api-key", opts.apiKey)` on every request (ky `beforeRequest` hook) |
| When omitted | No API-key header (unauthenticated or cookie-session path elsewhere) |
| Key source (tools) | Resolved from `@helloworld/terminal/config` per environment — **not** root `.env` `API_KEY` |
| Rejected | Static env-only global `API_KEY` as the product credential model ([ADR 0003](../../spec/decisions/0003-better-auth.md)) |

OpenAPI / Swagger should document the same `x-api-key` scheme so Orval and humans stay aligned.

## Customization (do not edit generated/)

| Hebel            | Datei                          | Wofür                                        |
| ---------------- | ------------------------------ | -------------------------------------------- |
| Transport / auth | `src/http.ts`                  | ky, headers, timeouts, error mapping         |
| Facade           | `src/index.ts`                 | `createApiClient(opts)`, re-exports, helpers |
| Per-route        | `orval.config.ts` → `override` | einzelne Operationen anders                  |
| Templates        | Orval custom templates         | nur wenn Struktur grundsätzlich nicht passt  |

## Consumers

`tools/cli`, `tools/tui`: resolve URL/key via `@helloworld/terminal/config`, then `configureClient` + generated calls.  
`apps/web`: same package; session/cookies in mutator variant — **not** `packages/terminal`.

Wiring (`openapi:export`, Orval dep, `orval.config.ts`, `http.ts`) lands when Nest is scaffolded. Until `openapi.json` exists, `generate:client` exits 0 and skips.
