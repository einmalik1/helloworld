# api-client

Typed REST SDK for `apps/api` (and later `apps/worker`). **Orval** generates the client from OpenAPI; **ky** is the transport via a hand-written mutator.

Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagesapi-client).  
Build: Orval into `src/generated/` → then `tsc` → `dist/` — [`Build / emit contract`](../../spec/tech-stack.md#build--emit-contract).

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

## ky mutator (sketch)

```ts
// packages/api-client/src/http.ts
import ky, { type Options } from "ky";

export type ClientOptions = {
  apiUrl: string;
  apiKey?: string;
};

const GENERAL_TIMEOUT_MS = 30_000;
const HEALTH_TIMEOUT_MS = 3_000;

let http = ky.create({ timeout: GENERAL_TIMEOUT_MS });

export function configureClient(opts: ClientOptions): void {
  http = ky.create({
    prefixUrl: opts.apiUrl.replace(/\/$/, ""),
    timeout: GENERAL_TIMEOUT_MS,
    hooks: {
      beforeRequest: [
        (req) => {
          if (opts.apiKey) req.headers.set("x-api-key", opts.apiKey);
        },
      ],
    },
  });
}

/** Orval mutator — (url, options) → Promise<T> */
export const customFetch = async <T>(url: string, options?: Options): Promise<T> => {
  return http(url, options).json<T>();
};

/** Health probe — 3s timeout; used by CLI/TUI aggregation */
export async function fetchHealth<T = unknown>(path = "health"): Promise<T> {
  return http.get(path, { timeout: HEALTH_TIMEOUT_MS }).json<T>();
}
```

## Customization (do not edit generated/)

| Hebel | Datei | Wofür |
|---|---|---|
| Transport / auth | `src/http.ts` | ky, headers, timeouts, error mapping |
| Facade | `src/index.ts` | `createApiClient(opts)`, re-exports, helpers |
| Per-route | `orval.config.ts` → `override` | einzelne Operationen anders |
| Templates | Orval custom templates | nur wenn Struktur grundsätzlich nicht passt |

## Consumers

`tools/cli`, `tools/tui`: resolve URL/key via `@helloworld/terminal/config`, then `configureClient` + generated calls.  
`apps/web`: same package; session/cookies in mutator variant — **not** `packages/terminal`.

Wiring (`openapi:export`, Orval dep, `orval.config.ts`, `http.ts`) lands when Nest is scaffolded. Until `openapi.json` exists, `generate:client` exits 0 and skips.
