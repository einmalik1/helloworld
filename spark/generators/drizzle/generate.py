"""JSON → domain Drizzle TS under packages/modules (generators.drizzle.out_dir)."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from generators.config import GeneratorsConfig

HEADER = (
    "/**\n"
    " * Generated from schema-model.json — do not edit by hand.\n"
    " * Regenerate: pnpm generate:drizzle\n"
    " */\n"
)


def _sql_to_drizzle_col(sql_type: str) -> tuple[str, str]:
    """Return (import_symbol, constructor_call_prefix without args)."""
    t = sql_type.lower().strip()
    if t == "uuid":
        return "uuid", "uuid"
    if t in ("text", "citext") or t.startswith("varchar") or t.startswith("char"):
        return "text", "text"
    if t in ("integer", "smallint", "int", "int4", "int2"):
        return "integer", "integer"
    if t in ("bigint", "int8"):
        return "bigint", "bigint"
    if t == "boolean":
        return "boolean", "boolean"
    if t == "date":
        return "date", "date"
    if t in ("timestamptz", "timestamp with time zone"):
        return "timestamp", 'timestamp'
    if t in ("timestamp", "timestamp without time zone"):
        return "timestamp", "timestamp"
    if t in ("jsonb", "json"):
        return "jsonb", "jsonb"
    if t in ("numeric", "decimal"):
        return "numeric", "numeric"
    if t in ("double precision", "real"):
        return "doublePrecision", "doublePrecision"
    return "text", "text"


def _default_expr(sql_type: str, default_value: str | None) -> str | None:
    if not default_value:
        return None
    raw = default_value.strip()
    lower = raw.lower()
    t = sql_type.lower().strip()
    if t == "uuid" and "gen_random_uuid" in lower:
        return ".defaultRandom()"
    if t in ("timestamptz", "timestamp", "timestamp with time zone", "timestamp without time zone"):
        if lower in ("now()", "current_timestamp"):
            return ".defaultNow()"
    if lower.startswith("nextval"):
        return f".default(sql`{raw}`)"
    # string / numeric literals
    if (raw.startswith("'") and raw.endswith("'")) or re.fullmatch(r"-?\d+(\.\d+)?", raw):
        return f".default({raw})"
    return f".default(sql`{raw}`)"


def _on_delete(action: str | None) -> str:
    if not action:
        return "no action"
    return action.lower().replace("_", " ")


def _table_file(table: dict[str, Any], all_table_names: set[str]) -> str:
    name = table["name"]
    imports: set[str] = {"pgTable"}
    needs_sql = bool(table.get("checkConstraints"))
    needs_check = bool(table.get("checkConstraints"))
    needs_index = bool(table.get("indexes"))
    needs_unique = any(len(u["columns"]) > 1 for u in table.get("uniqueConstraints", []))

    ref_imports: dict[str, str] = {}

    col_lines: list[str] = []
    for col in table["columns"]:
        sym, ctor = _sql_to_drizzle_col(col["sqlType"])
        imports.add(sym)
        expr = f'{ctor}("{col["name"]}"'
        if ctor == "timestamp" and col["sqlType"].lower().startswith("timestamptz"):
            expr += ", { withTimezone: true }"
        elif ctor == "timestamp":
            expr += ", { withTimezone: false }"
        expr += ")"

        if col.get("isPrimaryKey"):
            expr += ".primaryKey()"
        elif not col.get("nullable"):
            expr += ".notNull()"

        default = _default_expr(col["sqlType"], col.get("defaultValue"))
        if default:
            if "sql`" in default:
                needs_sql = True
            expr += default

        for uq in table.get("uniqueConstraints", []):
            if uq["columns"] == [col["name"]]:
                expr += ".unique()"

        refs = col.get("references")
        if refs and isinstance(refs, dict):
            ref_table = refs["table"]
            ref_col = refs["column"]
            if ref_table in all_table_names:
                ref_imports[ref_table] = ref_table
                on_del = _on_delete(refs.get("onDelete"))
                expr += (
                    f'.references(() => {ref_table}.{ref_col}, {{ onDelete: "{on_del}" }})'
                )

        comment = (col.get("comment") or "").replace("\n", " ").strip()
        suffix = f" // {comment}" if comment else ""
        col_lines.append(f"  {col['name']}: {expr},{suffix}")

    if needs_check:
        imports.add("check")
    if needs_index:
        imports.add("index")
    if needs_unique:
        imports.add("unique")

    table_config_parts: list[str] = []
    for uq in table.get("uniqueConstraints", []):
        if len(uq["columns"]) > 1:
            cols = ", ".join(f"t.{c}" for c in uq["columns"])
            uq_name = uq.get("name") or f"{name}_{'_'.join(uq['columns'])}_unique"
            table_config_parts.append(f'    unique("{uq_name}").on({cols}),')
    for ck in table.get("checkConstraints", []):
        definition = ck.get("definition") or ""
        m = re.match(r"CHECK\s*\((.*)\)\s*$", definition, re.I | re.S)
        inner = m.group(1) if m else definition
        ck_name = ck.get("name") or f"{name}_check"
        table_config_parts.append(f'    check("{ck_name}", sql`{inner}`),')
    for ix in table.get("indexes", []):
        cols = ", ".join(f"t.{c}" for c in ix["columns"])
        ix_name = ix.get("name") or f"{name}_{'_'.join(ix['columns'])}_idx"
        table_config_parts.append(f'    index("{ix_name}").on({cols}),')

    sorted_pg = ", ".join(sorted(imports))
    lines: list[str] = [HEADER]
    lines.append(f'import {{ {sorted_pg} }} from "drizzle-orm/pg-core";')
    if needs_sql:
        lines.append('import { sql } from "drizzle-orm";')
    for ref_table in sorted(ref_imports):
        if ref_table != name:
            lines.append(f'import {{ {ref_table} }} from "./{ref_table}.js";')
    lines.append("")
    lines.append(f'export const {name} = pgTable("{name}", {{')
    lines.extend(col_lines)
    if table_config_parts:
        lines.append("}, (t) => [")
        lines.extend(table_config_parts)
        lines.append("]);")
    else:
        lines.append("});")
    lines.append("")
    return "\n".join(lines)


def generate_drizzle(cfg: GeneratorsConfig, model: dict[str, Any]) -> None:
    if not cfg.drizzle.enabled:
        print("drizzle: skipped (disabled in repo-profile)")
        return

    out = cfg.path(cfg.drizzle.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    tables = model["tables"]
    names = {t["name"] for t in tables}

    # Clear previous generated table files (keep directory)
    for existing in out.glob("*.ts"):
        existing.unlink()

    for table in tables:
        content = _table_file(table, names)
        (out / f"{table['name']}.ts").write_text(content, encoding="utf-8")

    export_lines = [
        HEADER.rstrip("\n"),
        "",
        *[f'export {{ {t["name"]} }} from "./{t["name"]}.js";' for t in tables],
        "",
    ]
    (out / "index.ts").write_text("\n".join(export_lines), encoding="utf-8")

    print(f"drizzle/: {len(tables)} tables → {cfg.drizzle.out_dir}")
