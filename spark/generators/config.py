"""Load generators config from spark/repo-profile.yaml."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

FALLBACK_CATEGORY_COLOR = "#64748b"
PROFILE_REL = Path("spark/repo-profile.yaml")


@dataclass
class Category:
    key: str
    label: str
    color: str


@dataclass
class ErdConfig:
    enabled: bool = True
    out_dir: str = "spec/erd/generated"
    nicht_crud_katalog: str | None = "spec/erd/nicht-crud-katalog.md"
    audit_fk_columns: list[str] = field(default_factory=list)


@dataclass
class DocsConfig:
    enabled: bool = True
    out_dir: str = "spec/erd/generated/docs"


@dataclass
class TypesConfig:
    enabled: bool = True
    out_dirs: list[str] = field(default_factory=list)


@dataclass
class ApiConfig:
    enabled: bool = True
    out_dir: str = "packages/types/src/api"
    create_omit_columns: list[str] = field(
        default_factory=lambda: ["created_at", "updated_at"]
    )


@dataclass
class NestDtoConfig:
    enabled: bool = True
    out_dir: str = "apps/api/src"
    import_types_from: str = "@helloworld/types/api"


@dataclass
class GeneratorsConfig:
    repo_root: Path
    schema_sql: str
    schema_model: str
    categories: list[Category]
    erd: ErdConfig
    docs: DocsConfig
    types: TypesConfig
    api: ApiConfig
    nest_dto: NestDtoConfig

    def path(self, rel: str) -> Path:
        return (self.repo_root / rel).resolve()


def find_repo_root(start: Path | None = None) -> Path:
    here = (start or Path.cwd()).resolve()
    for candidate in [here, *here.parents]:
        if (candidate / PROFILE_REL).is_file() and (candidate / "spec" / "erd").is_dir():
            return candidate
    raise FileNotFoundError(
        f"Could not find repo root containing {PROFILE_REL} (started at {here})"
    )


def load_generators_config(repo_root: Path | None = None) -> GeneratorsConfig:
    root = repo_root or find_repo_root()
    profile_path = root / PROFILE_REL
    data: dict[str, Any] = yaml.safe_load(profile_path.read_text(encoding="utf-8")) or {}
    block = data.get("generators")
    if not block or not isinstance(block, dict):
        raise ValueError(
            f"Missing required `generators:` section in {profile_path}. "
            "Add categories and erd/docs/types/api/nest_dto settings (see spark/generators/README.md)."
        )

    raw_cats = block.get("categories")
    if not isinstance(raw_cats, list) or not raw_cats:
        raise ValueError(
            f"`generators.categories` must be a non-empty list in {profile_path}"
        )

    categories: list[Category] = []
    for item in raw_cats:
        if not isinstance(item, dict) or "key" not in item:
            raise ValueError(f"Invalid category entry in {profile_path}: {item!r}")
        key = str(item["key"])
        categories.append(
            Category(
                key=key,
                label=str(item.get("label") or key),
                color=str(item.get("color") or FALLBACK_CATEGORY_COLOR),
            )
        )

    erd_raw = block.get("erd") or {}
    docs_raw = block.get("docs") or {}
    types_raw = block.get("types") or {}
    api_raw = block.get("api") or {}
    nest_raw = block.get("nest_dto") or {}

    schema_sql = block.get("schema_sql") or "spec/erd/schema.sql"
    schema_model = block.get("schema_model") or "spec/erd/generated/schema-model.json"

    erd = ErdConfig(
        enabled=bool(erd_raw.get("enabled", True)),
        out_dir=str(erd_raw.get("out_dir") or "spec/erd/generated"),
        nicht_crud_katalog=erd_raw.get("nicht_crud_katalog"),
        audit_fk_columns=[str(c) for c in (erd_raw.get("audit_fk_columns") or [])],
    )
    docs = DocsConfig(
        enabled=bool(docs_raw.get("enabled", True)),
        out_dir=str(docs_raw.get("out_dir") or "spec/erd/generated/docs"),
    )
    out_dirs = types_raw.get("out_dirs") or [
        "spec/erd/generated/types",
        "packages/types/src/schema",
    ]
    types = TypesConfig(
        enabled=bool(types_raw.get("enabled", True)),
        out_dirs=[str(p) for p in out_dirs],
    )
    omit = api_raw.get("create_omit_columns")
    if omit is None:
        omit = ["created_at", "updated_at"]
    api = ApiConfig(
        enabled=bool(api_raw.get("enabled", True)),
        out_dir=str(api_raw.get("out_dir") or "packages/types/src/api"),
        create_omit_columns=[str(c) for c in omit],
    )
    nest_dto = NestDtoConfig(
        enabled=bool(nest_raw.get("enabled", True)),
        out_dir=str(nest_raw.get("out_dir") or "apps/api/src"),
        import_types_from=str(nest_raw.get("import_types_from") or "@helloworld/types/api"),
    )

    return GeneratorsConfig(
        repo_root=root,
        schema_sql=str(schema_sql),
        schema_model=str(schema_model),
        categories=categories,
        erd=erd,
        docs=docs,
        types=types,
        api=api,
        nest_dto=nest_dto,
    )
