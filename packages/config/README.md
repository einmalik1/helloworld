# config

Shared tooling configuration only — no application code, no `tsc` emit.

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesconfig).  
Exception to the dist contract: exports stay as config files — [`Build / emit`](../../openspec/tech-stack.md#build--emit-contract).

## Layout

| Export   | File                 | Purpose                                                                   |
| -------- | -------------------- | ------------------------------------------------------------------------- |
| tsconfig | `tsconfig.base.json` | Strict TS, ESM, decorators, `nodenext`                                    |
| vitest   | `vitest.config.ts`   | Shared Vitest base — extend and add SWC when Nest decorator tests need it |
| oxlint   | `oxlintrc.json`      | Shared lint rules                                                         |

Workspaces extend these when wired (e.g. `"extends": "@helloworld/config/tsconfig"`). Package name: `@helloworld/config`.
