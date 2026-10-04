# config

Shared tooling configuration only — no application code, no `tsc` emit.

Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagesconfig).  
Exception to the dist contract: exports stay as config files — [`Build / emit`](../../spec/tech-stack.md#build--emit-contract).

## Layout (intent)

| Export | File | Purpose |
|---|---|---|
| tsconfig | `tsconfig.base.json` | Strict TS, ESM, decorators, `nodenext` |
| vitest | `vitest.config.ts` | Shared Vitest base — **SWC** (or equivalent) so Nest decorator metadata works in tests |
| oxlint | `oxlintrc.json` | Shared lint rules |

Workspaces extend these when the files exist (e.g. `"extends": "@helloworld/config/tsconfig"`). Package name intent: `@helloworld/config`.