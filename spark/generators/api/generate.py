"""JSON → API Zod schemas (Create / Update / Response) under packages/types/src/api."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from generators.config import GeneratorsConfig
from generators.core.naming import pascal

TEMPLATES = Path(__file__).resolve().parent / "templates"

HEADER = (
    "/**\n"
    " * Generated API Zod schemas — do not edit by hand.\n"
    " * Regenerate: pnpm generate\n"
    " */\n"
)


def _omit_on_create(table: dict[str, Any], omit_columns: set[str]) -> list[str]:
    names: list[str] = []
    for col in table["columns"]:
        if col["isPrimaryKey"] and col["hasDefault"]:
            names.append(col["name"])
        elif col["name"] in omit_columns:
            names.append(col["name"])
    # stable unique
    seen: set[str] = set()
    out: list[str] = []
    for n in names:
        if n not in seen:
            seen.add(n)
            out.append(n)
    return out


def generate_api(cfg: GeneratorsConfig, model: dict[str, Any]) -> None:
    if not cfg.api.enabled:
        print("api: skipped (disabled in repo-profile)")
        return

    omit_columns = set(cfg.api.create_omit_columns)
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES)),
        autoescape=select_autoescape(enabled_extensions=()),
        keep_trailing_newline=True,
    )
    table_tpl = env.get_template("resource.ts.j2")
    index_tpl = env.get_template("index.ts.j2")

    out = cfg.path(cfg.api.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    export_names: list[str] = []
    for table in model["tables"]:
        name = table["name"]
        export_names.append(name)
        p = pascal(name)
        omit = _omit_on_create(table, omit_columns)
        content = table_tpl.render(
            header=HEADER.strip(),
            table_name=name,
            pascal=p,
            omit_fields=omit,
        )
        (out / f"{name}.ts").write_text(content, encoding="utf-8")

    (out / "index.ts").write_text(
        index_tpl.render(exports=export_names),
        encoding="utf-8",
    )
    print(f"api/: {len(export_names)} resources → {cfg.api.out_dir}")
