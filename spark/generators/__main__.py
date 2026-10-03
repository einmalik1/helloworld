"""CLI: load repo-profile → core → erd → docs → types."""

from __future__ import annotations

import argparse
import json
import sys

from generators.config import find_repo_root, load_generators_config
from generators.core.parse_schema import build_schema_model, write_schema_model
from generators.docs.generate import generate_docs
from generators.erd.generate import generate_erd
from generators.types.generate import generate_types


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Hello World generators (SQL → JSON → ERD / docs / types)"
    )
    parser.add_argument(
        "--repo-root",
        type=str,
        default=None,
        help="Repository root (default: auto-detect)",
    )
    parser.add_argument(
        "--only",
        choices=("core", "erd", "docs", "types"),
        action="append",
        help="Run only selected stage(s); default = all",
    )
    args = parser.parse_args(argv)

    try:
        root = find_repo_root() if not args.repo_root else __import__("pathlib").Path(args.repo_root)
        cfg = load_generators_config(root.resolve())
    except (FileNotFoundError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    stages = set(args.only) if args.only else {"core", "erd", "docs", "types"}

    model = None
    if "core" in stages:
        model = build_schema_model(cfg)
        write_schema_model(cfg, model)
    else:
        model_path = cfg.path(cfg.schema_model)
        if not model_path.is_file():
            print(f"error: missing {model_path}; run core first", file=sys.stderr)
            return 1
        model = json.loads(model_path.read_text(encoding="utf-8"))

    if "erd" in stages:
        generate_erd(cfg, model)
    if "docs" in stages:
        generate_docs(cfg, model)
    if "types" in stages:
        generate_types(cfg, model)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
