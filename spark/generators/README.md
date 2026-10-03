# Generators

Python + Jinja2 pipeline: **SQL → JSON → ERD / docs / types**.

| SoT | Path |
|---|---|
| Generator config (categories, out dirs, flags) | [`spark/repo-profile.yaml`](../repo-profile.yaml) → `generators:` |
| DDL | [`spec/erd/schema.sql`](../../spec/erd/schema.sql) |
| Transfer model | `spec/erd/generated/schema-model.json` (written by **core**) |

```text
repo-profile.yaml ──┐
schema.sql ─────────┼→ core → schema-model.json
                    │         ├→ erd   (Mermaid, draw.io, erd.html)
                    │         ├→ docs  (Markdown catalog)
                    │         └→ types (Zod → spec/erd/generated/types + packages/types/src/schema)
```

## Run

From repo root:

```bash
pnpm erd:build
# or
python3 spark/generators/run.py
python3 spark/generators/run.py --only core
```

`run.py` creates `spark/generators/.venv` and installs `jinja2` + `pyyaml` on first use.

## Stages

| Stage | Package | Output |
|---|---|---|
| core | `generators/core` | `schema_model` path from profile |
| erd | `generators/erd` | `generators.erd.out_dir` |
| docs | `generators/docs` | `generators.docs.out_dir` |
| types | `generators/types` | each path in `generators.types.out_dirs` |

Categories (label/color) are defined only in the profile. Tables assign a key via `COMMENT ON TABLE … category: <key>`.
