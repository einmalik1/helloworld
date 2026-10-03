"""Entity tables → Nest createZodDto wrappers under apps/api."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from generators.config import GeneratorsConfig
from generators.core.naming import kebab, pascal

TEMPLATES = Path(__file__).resolve().parent / "templates"

HEADER = (
    "/**\n"
    " * Generated Nest DTO — do not edit by hand.\n"
    " * Regenerate: pnpm generate\n"
    " */\n"
)


def generate_nest_dto(cfg: GeneratorsConfig, model: dict[str, Any]) -> None:
    if not cfg.nest_dto.enabled:
        print("nest_dto: skipped (disabled in repo-profile)")
        return

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES)),
        autoescape=select_autoescape(enabled_extensions=()),
        keep_trailing_newline=True,
    )
    dto_tpl = env.get_template("dto.ts.j2")
    index_tpl = env.get_template("resource-index.ts.j2")

    base = cfg.path(cfg.nest_dto.out_dir)
    import_from = cfg.nest_dto.import_types_from
    count = 0

    for table in model["tables"]:
        name = table["name"]
        p = pascal(name)
        resource = kebab(name)
        dto_dir = base / resource / "dto"
        dto_dir.mkdir(parents=True, exist_ok=True)

        specs = [
            ("create", f"Create{p}Schema", f"Create{p}Dto", f"create-{resource}.dto.ts"),
            ("update", f"Update{p}Schema", f"Update{p}Dto", f"update-{resource}.dto.ts"),
            ("response", f"{p}ResponseSchema", f"{p}ResponseDto", f"{resource}-response.dto.ts"),
        ]
        export_files: list[str] = []
        for _kind, schema_name, class_name, filename in specs:
            content = dto_tpl.render(
                header=HEADER.strip(),
                import_from=import_from,
                schema_name=schema_name,
                class_name=class_name,
            )
            (dto_dir / filename).write_text(content, encoding="utf-8")
            export_files.append(filename.replace(".ts", ".js"))
            count += 1

        (dto_dir / "index.ts").write_text(
            index_tpl.render(exports=export_files),
            encoding="utf-8",
        )

    print(f"nest_dto/: {count} DTO files → {cfg.nest_dto.out_dir}/{{resource}}/dto/")
