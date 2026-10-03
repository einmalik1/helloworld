"""JSON → Zod/TS scaffolds (paths from generators.types.out_dirs)."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from generators.config import GeneratorsConfig

TEMPLATES = Path(__file__).resolve().parent / "templates"


def _pascal(name: str) -> str:
    return "".join(p[:1].upper() + p[1:] for p in re.split(r"[_\s]+", name) if p)


def sql_to_zod(sql_type: str) -> str:
    t = sql_type.lower().strip()
    if t == "uuid":
        return "z.string().uuid()"
    if t in ("text", "citext") or t.startswith("varchar") or t.startswith("char"):
        return "z.string()"
    if t in ("integer", "smallint", "int", "int4", "int2"):
        return "z.number().int()"
    if t in ("bigint", "int8"):
        return "z.union([z.number(), z.bigint()])"
    if t == "boolean":
        return "z.boolean()"
    if t == "date":
        return "z.coerce.date()"
    if t in ("timestamptz", "timestamp"):
        return "z.coerce.date()"
    if t == "jsonb" or t == "json":
        return "z.unknown()"
    if t.endswith("[]"):
        return "z.array(z.unknown())"
    if t in ("numeric", "decimal", "double precision", "real"):
        return "z.number()"
    return "z.unknown()"


def _fields_for_table(table: dict[str, Any]) -> list[dict[str, Any]]:
    fields = []
    for col in table["columns"]:
        required = (not col["nullable"]) and (not col["hasDefault"]) and (not col["isPrimaryKey"])
        # PK with default (gen_random_uuid) is optional on create-shaped objects;
        # keep required only for NOT NULL without default.
        if col["isPrimaryKey"] and col["hasDefault"]:
            required = False
        elif col["nullable"] or col["hasDefault"]:
            required = False
        else:
            required = True
        fields.append(
            {
                "name": col["name"],
                "zod": sql_to_zod(col["sqlType"]),
                "required": required,
                "comment": (col.get("comment") or "").replace("\n", " "),
            }
        )
    return fields


def generate_types(cfg: GeneratorsConfig, model: dict[str, Any]) -> None:
    if not cfg.types.enabled:
        print("types: skipped (disabled in repo-profile)")
        return

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES)),
        autoescape=select_autoescape(enabled_extensions=()),
        keep_trailing_newline=True,
    )
    index_tpl = env.get_template("index.ts.j2")

    export_names = [t["name"] for t in model["tables"]]
    files: dict[str, str] = {
        "index.ts": index_tpl.render(exports=export_names),
    }
    for table in model["tables"]:
        pascal = _pascal(table["name"])
        schema_name = f"{pascal}Schema"
        field_lines: list[str] = []
        for field in _fields_for_table(table):
            expr = field["zod"] + ("" if field["required"] else ".optional()")
            comment = f" // {field['comment']}" if field["comment"] else ""
            field_lines.append(f"  {field['name']}: {expr},{comment}")
        body = "\n".join(field_lines)
        files[f"{table['name']}.ts"] = (
            "/**\n"
            " * Generated from schema-model.json — do not edit by hand.\n"
            " * Regenerate: pnpm erd:build\n"
            " */\n"
            'import { z } from "zod";\n'
            "\n"
            f"export const {schema_name} = z.object({{\n"
            f"{body}\n"
            "});\n"
            "\n"
            f"export type {pascal} = z.infer<typeof {schema_name}>;\n"
        )

    for rel in cfg.types.out_dirs:
        out = cfg.path(rel)
        out.mkdir(parents=True, exist_ok=True)
        for name, content in files.items():
            (out / name).write_text(content, encoding="utf-8")

    print(f"types/: {len(export_names)} tables → {', '.join(cfg.types.out_dirs)}")
