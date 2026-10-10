# config

Shared tooling configuration only — no application code, no `tsc` emit.

Stack: [`openspec/tech-stack.md`](../../openspec/tech-stack.md#packagesconfig).  
Exception to the dist contract: exports stay as config files — [`Build / emit`](../../openspec/tech-stack.md#build--emit-contract).  
Module / compiler decisions: [`tech-stack.md` § Module / compiler rules](../../openspec/tech-stack.md#module--compiler-rules-all-ts-workspaces) (topic **#8**, GH [#15](https://github.com/einmalik1/helloworld/issues/15)).

## Layout (intent)

| Export | File | Purpose |
|---|---|---|
| tsconfig | `tsconfig.base.json` | Strict TS, ESM, decorators, `nodenext` |
| vitest | `vitest.config.ts` | Shared Vitest base — **SWC** so Nest decorator metadata works in tests |
| oxlint | `oxlintrc.json` | Shared lint rules |

Workspaces extend these when the files exist (e.g. `"extends": "@helloworld/config/tsconfig"`). Package name intent: `@helloworld/config`.

## What the bases guarantee

### `tsconfig.base.json`

Shared TypeScript baseline for all TS workspaces. Intent when landed:

| Option / rule | Value | Guarantee |
|---|---|---|
| `target` | **ES2024** | Preferred with inventory TypeScript **7** + Node **26**; fallback **ES2023** only if the Nest DI / emit spike fails — then record the reason here |
| `module` / `moduleResolution` | `nodenext` | ESM; relative imports use `.js` suffixes |
| Strict flags | on | No silent looseness in consumers |
| Nest decorators | `experimentalDecorators` + `emitDecoratorMetadata` | Required so Nest DI metadata is available from `nest build` / `tsc` emit |

Language and runtime versions are **not** redefined here — see inventory (TS **7.0.2**, Node **26** / `.nvmrc` / `engines.node`).

### `vitest.config.ts`

Shared Vitest base. Intent when landed:

| Piece | Choice | Guarantee |
|---|---|---|
| SWC | **`unplugin-swc` 2.0.0** | Vitest can run Nest-decorator code with metadata in **tests** |
| SWC scope | **Vitest only** | Does **not** replace Nest/`tsc` production emit |

### Nest DI / metadata ownership

**Spike (impl):** run one Nest DI smoke under TypeScript 7 (`nest build` / `tsc` with `emitDecoratorMetadata`).

| Result | What to do |
|---|---|
| Smoke green | Keep Nest/`tsc` as metadata owner for emit; SWC stays Vitest-only |
| `emitDecoratorMetadata` fails for Nest DI | Document the workaround **here**: who owns decorator metadata for runtime (Nest compiler plugin and/or SWC for emit) — and set `target` to **ES2023** if that was the failing factor |

Until the spike runs, assume Nest/`tsc` owns production metadata and SWC is test-only.
