"""JSON → Markdown catalog under generators.docs.out_dir."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from generators.config import GeneratorsConfig

TEMPLATES = Path(__file__).resolve().parent / "templates"


def generate_docs(cfg: GeneratorsConfig, model: dict[str, Any]) -> None:
    if not cfg.docs.enabled:
        print("docs: skipped (disabled in repo-profile)")
        return
    out = cfg.path(cfg.docs.out_dir)
    (out / "tables").mkdir(parents=True, exist_ok=True)
    (out / "categories").mkdir(parents=True, exist_ok=True)

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES)),
        autoescape=select_autoescape(enabled_extensions=()),
        trim_blocks=True,
        lstrip_blocks=True,
    )

    (out / "index.md").write_text(
        env.get_template("index.md.j2").render(
            categories=model["categories"],
            tables=model["tables"],
        ),
        encoding="utf-8",
    )

    for category in model["categories"]:
        members = set(category["tables"])
        edges = [
            e
            for e in model["edges"]
            if e["fromTable"] in members or e["toTable"] in members
        ]
        (out / "categories" / f"{category['key']}.md").write_text(
            env.get_template("category.md.j2").render(category=category, edges=edges),
            encoding="utf-8",
        )

    for table in model["tables"]:
        (out / "tables" / f"{table['name']}.md").write_text(
            env.get_template("table.md.j2").render(table=table),
            encoding="utf-8",
        )

    print(
        f"docs/: index + {len(model['categories'])} categories + "
        f"{len(model['tables'])} tables → {cfg.docs.out_dir}"
    )
