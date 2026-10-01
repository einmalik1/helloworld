# config

Shared tooling configuration only — no application code.

Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagesconfig).

## Layout (intent)

| Export | File | Purpose |
|---|---|---|
| tsconfig | `tsconfig.base.json` | Strict TS, ESM, decorators, `nodenext` |
| vitest | `vitest.config.ts` | Shared Vitest base |
| oxlint | `oxlintrc.json` | Shared lint rules |

Workspaces extend these when the files exist (e.g. `"extends": "@helloworld/config/tsconfig"`).
