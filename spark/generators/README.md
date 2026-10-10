# Generators

Python + Jinja2 pipeline: **SQL → JSON → ERD / docs / entity Zod / API Zod / Nest DTOs**, then (from root `pnpm generate`) **Orval** for the HTTP client.

| SoT              | Path                                                              |
| ---------------- | ----------------------------------------------------------------- |
| Generator config | [`spark/repo-profile.yaml`](../repo-profile.yaml) → `generators:` |
| DDL              | [`openspec/data-model/schema.sql`](../../openspec/data-model/schema.sql)                |
| Transfer model   | `openspec/data-model/generated/schema-model.json` (written by **core**)      |

```text
repo-profile.yaml ──┐
schema.sql ─────────┼→ core → schema-model.json
                    │         ├→ erd        (Mermaid, draw.io, erd.html)
                    │         ├→ docs       (Markdown catalog)
                    │         ├→ types      (Entity Zod → packages/types/src/schema)
                    │         ├→ api        (API Zod → packages/types/src/api)
                    │         └→ nest_dto   (createZodDto → apps/api/src/{resource}/dto)
                    │
pnpm generate:client ─→ Orval (apps/api/openapi.json → packages/api-client/src/generated)
```

## Commands (repo root)

| Script                   | What                                                   |
| ------------------------ | ------------------------------------------------------ |
| `pnpm generate`          | Full pipeline: all code stages + Orval client          |
| `pnpm generate:code`     | Python stages only (`core` → `nest_dto`)               |
| `pnpm generate:core`     | SQL → `schema-model.json`                              |
| `pnpm generate:erd`      | JSON → ERD diagrams / HTML                             |
| `pnpm generate:docs`     | JSON → Markdown catalog                                |
| `pnpm generate:types`    | Entity Zod                                             |
| `pnpm generate:api`      | API Zod (Create/Update/Response)                       |
| `pnpm generate:nest-dto` | Nest `createZodDto` files                              |
| `pnpm generate:client`   | Orval SDK (skips until `apps/api/openapi.json` exists) |

Low-level:

```bash
python3 spark/generators/run.py
python3 spark/generators/run.py --only core
python3 spark/generators/run.py --only api --only nest_dto
```

`run.py` creates `spark/generators/.venv` and installs `jinja2` + `pyyaml` on first use.

## Stages (Python)

| Stage    | Package               | Output                                             |
| -------- | --------------------- | -------------------------------------------------- |
| core     | `generators/core`     | `schema_model` path from profile                   |
| erd      | `generators/erd`      | `generators.erd.out_dir`                           |
| docs     | `generators/docs`     | `generators.docs.out_dir`                          |
| types    | `generators/types`    | each path in `generators.types.out_dirs`           |
| api      | `generators/api`      | `generators.api.out_dir`                           |
| nest_dto | `generators/nest_dto` | `{nest_dto.out_dir}/{kebab-resource}/dto/*.dto.ts` |

Categories (label/color) are defined only in the profile. Tables assign a key via `COMMENT ON TABLE … category: <key>`.
