"""SQL DDL → schema-model.json (categories from repo-profile, not SQL @category)."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from generators.config import FALLBACK_CATEGORY_COLOR, GeneratorsConfig


def read_statements(sql: str) -> list[str]:
    without_comments = "\n".join(
        line for line in sql.split("\n") if not line.lstrip().startswith("--")
    )
    statements: list[str] = []
    current = ""
    in_string = False
    for ch in without_comments:
        if ch == "'":
            in_string = not in_string
        if ch == ";" and not in_string:
            if current.strip():
                statements.append(current.strip())
            current = ""
        else:
            current += ch
    if current.strip():
        statements.append(current.strip())
    return statements


def parse_column_list(raw: str) -> list[str]:
    parts: list[str] = []
    depth = 0
    current = ""
    for ch in raw:
        if ch == "(":
            depth += 1
        if ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(current.strip().replace('"', ""))
            current = ""
        else:
            current += ch
    if current.strip():
        parts.append(current.strip().replace('"', ""))
    return parts


def extract_sql_type(rest: str) -> str:
    stop = re.search(
        r"\s+(NOT NULL|NULL|DEFAULT|PRIMARY KEY|REFERENCES|CONSTRAINT|UNIQUE|CHECK)\b",
        rest,
        re.I,
    )
    raw = rest[: stop.start()] if stop else rest
    return re.sub(r"\s+", " ", raw.strip())


def map_logical_type(sql_type: str) -> str:
    t = sql_type.lower()
    if t == "uuid":
        return "UUID"
    if t == "citext" or t.startswith("varchar") or t == "text":
        return "Text"
    if t == "char(3)":
        return "ISO currency"
    if t == "char(18)":
        return "External ID (18)"
    if t in ("bigint", "integer", "smallint"):
        return "Integer"
    if t == "boolean":
        return "Boolean"
    if t == "date":
        return "Date"
    if t == "timestamptz":
        return "Timestamp (TZ)"
    if t == "inet":
        return "IP address"
    if t == "jsonb":
        return "JSON"
    if t.endswith("[]"):
        return "Array"
    return sql_type


def parse_column(element: str) -> dict[str, Any] | None:
    name_match = re.match(r'^"?([a-z_][a-z0-9_]*)"?\s+(.+)$', element, re.I)
    if not name_match:
        return None
    name = name_match.group(1)
    rest = name_match.group(2)

    references = None
    ref_match = re.search(
        r'REFERENCES "?([a-z_][a-z0-9_]*)"?\s*\(\s*"?([a-z_][a-z0-9_]*)"?\s*\)'
        r"(\s+ON DELETE (CASCADE|SET NULL|RESTRICT|NO ACTION))?",
        rest,
        re.I,
    )
    if ref_match:
        on_delete = ref_match.group(4)
        if on_delete == "NO ACTION":
            on_delete = None
        references = {
            "table": ref_match.group(1),
            "column": ref_match.group(2),
            "onDelete": on_delete,
        }

    is_primary_key = bool(re.search(r"\bPRIMARY KEY\b", rest, re.I))
    nullable = not bool(re.search(r"\bNOT NULL\b", rest, re.I))
    default_match = re.search(r"\bDEFAULT\s+([^\s,]+)", rest, re.I)
    sql_type = extract_sql_type(rest)

    return {
        "name": name,
        "sqlType": sql_type,
        "logicalType": map_logical_type(sql_type),
        "nullable": nullable,
        "hasDefault": default_match is not None,
        "defaultValue": default_match.group(1) if default_match else None,
        "references": references,
        "logicalReference": None,
        "isPrimaryKey": is_primary_key,
        "comment": None,
    }


def parse_create_table(stmt: str) -> dict[str, Any] | None:
    compact = re.sub(r"\s+", " ", stmt)
    match = re.match(
        r'^CREATE TABLE (?:"([^"]+)"|([a-z_][a-z0-9_]*)) \(([\s\S]*)\)$',
        compact,
        re.I,
    )
    if not match:
        return None
    table_name = match.group(1) or match.group(2)
    body = match.group(3)

    table: dict[str, Any] = {
        "name": table_name,
        "category": "uncategorized",
        "label": table_name,
        "spec": "",
        "description": "",
        "columns": [],
        "primaryKey": [],
        "uniqueConstraints": [],
        "checkConstraints": [],
        "indexes": [],
        "foreignKeys": [],
    }

    elements: list[str] = []
    depth = 0
    current = ""
    for ch in body:
        if ch == "(":
            depth += 1
        if ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            elements.append(current.strip())
            current = ""
        else:
            current += ch
    if current.strip():
        elements.append(current.strip())

    for element in elements:
        if re.match(r"^PRIMARY KEY \((.+)\)$", element, re.I):
            table["primaryKey"] = parse_column_list(
                re.sub(r"^PRIMARY KEY \((.+)\)$", r"\1", element, flags=re.I)
            )
            continue
        if re.match(r"^CONSTRAINT .+ UNIQUE \((.+)\)$", element, re.I):
            name = re.match(r"^CONSTRAINT (\S+)", element, re.I)
            table["uniqueConstraints"].append(
                {
                    "name": name.group(1) if name else "",
                    "columns": parse_column_list(
                        re.sub(
                            r"^CONSTRAINT \S+ UNIQUE \((.+)\)$",
                            r"\1",
                            element,
                            flags=re.I,
                        )
                    ),
                }
            )
            continue
        if re.match(r"^CONSTRAINT .+ CHECK \(", element, re.I):
            name = re.match(r"^CONSTRAINT (\S+)", element, re.I)
            table["checkConstraints"].append(
                {"name": name.group(1) if name else "", "definition": element}
            )
            continue
        if re.match(r"^UNIQUE \((.+)\)$", element, re.I):
            table["uniqueConstraints"].append(
                {
                    "name": f"{table_name}_unique",
                    "columns": parse_column_list(
                        re.sub(r"^UNIQUE \((.+)\)$", r"\1", element, flags=re.I)
                    ),
                }
            )
            continue
        if re.match(r"^CHECK \(", element, re.I):
            table["checkConstraints"].append(
                {"name": f"{table_name}_check", "definition": element}
            )
            continue
        if re.match(r"^FOREIGN KEY", element, re.I):
            continue

        column = parse_column(element)
        if column:
            table["columns"].append(column)
            if column["isPrimaryKey"]:
                table["primaryKey"].append(column["name"])
            if column["references"]:
                table["foreignKeys"].append(
                    {
                        "column": column["name"],
                        "references": (
                            f"{column['references']['table']}."
                            f"{column['references']['column']}"
                        ),
                        "onDelete": column["references"]["onDelete"],
                    }
                )
    return table


def parse_index(stmt: str, tables: dict[str, dict[str, Any]]) -> None:
    compact = re.sub(r"\s+", " ", stmt).strip()
    match = re.match(
        r"^CREATE (UNIQUE )?INDEX (?:IF NOT EXISTS )?([a-z_][a-z0-9_]*) ON "
        r'(?:"([^"]+)"|([a-z_][a-z0-9_]*)) \((.+?)\)( WHERE (.+))?$',
        compact,
        re.I,
    )
    if not match:
        return
    unique = bool(match.group(1))
    name = match.group(2)
    table_name = match.group(3) or match.group(4)
    columns = parse_column_list(match.group(5))
    partial = match.group(7)
    table = tables.get(table_name)
    if not table:
        return
    if unique:
        table["uniqueConstraints"].append({"name": f"{name} (Index)", "columns": columns})
    table["indexes"].append(
        {"name": name, "columns": columns, "unique": unique, "partial": partial}
    )


def extract_logical_reference(
    comment: str, existing_tables: set[str]
) -> dict[str, str] | None:
    pattern1 = re.search(
        r"logische[rn]? Referenz auf ([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)",
        comment,
        re.I,
    )
    pattern2 = re.search(
        r"referenziert ([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)\s*\(logisch",
        comment,
        re.I,
    )
    pattern3 = re.search(
        r"logische[rn]? Referenz auf (?:das|die|den)? ?[a-zäöüß ]*?: ?([a-z_][a-z0-9_]*)",
        comment,
        re.I,
    )
    named = pattern1 or pattern2
    if named:
        table, column = named.group(1), named.group(2)
        if table not in existing_tables:
            return None
        return {"table": table, "column": column}
    if pattern3:
        table = pattern3.group(1)
        if table not in existing_tables:
            return None
        return {"table": table, "column": "id"}
    return None


def parse_comment_on(
    stmt: str,
    tables: dict[str, dict[str, Any]],
    existing_tables: set[str],
) -> None:
    compact = re.sub(r"\s+", " ", stmt).strip()
    match = re.match(
        r"^COMMENT ON TABLE (?:\"([^\"]+)\"|([a-z_][a-z0-9_]*)) IS '(.*)'$",
        compact,
        re.I | re.M,
    )
    if match:
        table_name = match.group(1) or match.group(2)
        table = tables.get(table_name)
        if not table:
            return
        for part in match.group(3).split(" | "):
            part = part.strip()
            if ": " not in part:
                continue
            key, val = part.split(": ", 1)
            if key == "category":
                table["category"] = val
            elif key == "label":
                table["label"] = val
            elif key == "spec":
                table["spec"] = val
            elif key == "desc":
                table["description"] = val
        return

    col_match = re.match(
        r"^COMMENT ON COLUMN (?:\"([^\"]+)\"|([a-z_][a-z0-9_]*))"
        r"\.([a-z_][a-z0-9_]*) IS '(.*)'$",
        compact,
        re.I | re.M,
    )
    if col_match:
        table_name = col_match.group(1) or col_match.group(2)
        column_name = col_match.group(3)
        comment = col_match.group(4)
        table = tables.get(table_name)
        if not table:
            return
        for column in table["columns"]:
            if column["name"] == column_name:
                column["comment"] = comment
                column["logicalReference"] = extract_logical_reference(
                    comment, existing_tables
                )
                break


def build_external_references(tables: dict[str, dict[str, Any]]) -> list[dict[str, str]]:
    refs: list[dict[str, str]] = []
    for table in tables.values():
        for column in table["columns"]:
            is_sf = bool(re.search(r"_sf_id$", column["name"])) or column["name"] == "salesforce_id"
            if is_sf and column["sqlType"] == "char(18)":
                sf_object = "Salesforce"
                n = column["name"]
                if n.startswith("account_"):
                    sf_object = "Account"
                elif n.startswith("contact_"):
                    sf_object = "Contact"
                elif n.startswith("campaign_"):
                    sf_object = "Campaign"
                elif n.startswith("partner_account_"):
                    sf_object = "Partner Account"
                elif n.startswith("competitor_account_"):
                    sf_object = "Account (Wettbewerber)"
                elif n == "salesforce_id":
                    sf_object = "Salesforce (Shadow)"
                elif n == "contract_sf_id":
                    sf_object = "Contract"
                refs.append(
                    {"table": table["name"], "column": column["name"], "sfObject": sf_object}
                )
    return refs


def build_schema_model(cfg: GeneratorsConfig) -> dict[str, Any]:
    sql_path = cfg.path(cfg.schema_sql)
    sql = sql_path.read_text(encoding="utf-8")
    statements = read_statements(sql)

    tables: dict[str, dict[str, Any]] = {}
    comment_statements: list[str] = []

    for stmt in statements:
        if re.match(r"^CREATE TABLE ", stmt, re.I):
            table = parse_create_table(stmt)
            if table:
                tables[table["name"]] = table
        elif re.match(r"^CREATE (UNIQUE )?INDEX ", stmt, re.I):
            parse_index(stmt, tables)
        elif re.match(r"^COMMENT ON ", stmt, re.I):
            comment_statements.append(stmt)

    existing = set(tables.keys())
    for stmt in comment_statements:
        parse_comment_on(stmt, tables, existing)

    edges: list[dict[str, Any]] = []
    for table in tables.values():
        for fk in table["foreignKeys"]:
            to_table, to_column = fk["references"].split(".", 1)
            edges.append(
                {
                    "fromTable": table["name"],
                    "fromColumn": fk["column"],
                    "toTable": to_table,
                    "toColumn": to_column,
                    "kind": "fk",
                    "onDelete": fk["onDelete"],
                }
            )
        for column in table["columns"]:
            ref = column.get("logicalReference")
            if not ref:
                continue
            edges.append(
                {
                    "fromTable": table["name"],
                    "fromColumn": column["name"],
                    "toTable": ref["table"],
                    "toColumn": ref["column"],
                    "kind": "logical",
                    "onDelete": None,
                }
            )

    tables_by_category: dict[str, list[str]] = {}
    for table in tables.values():
        tables_by_category.setdefault(table["category"], []).append(table["name"])

    profile_keys = [c.key for c in cfg.categories]
    profile_defs = {c.key: c for c in cfg.categories}
    seen: set[str] = set()
    categories: list[dict[str, Any]] = []
    for key in [*profile_keys, *tables_by_category.keys()]:
        if key in seen:
            continue
        seen.add(key)
        defn = profile_defs.get(key)
        categories.append(
            {
                "key": key,
                "label": defn.label if defn else key,
                "color": defn.color if defn else FALLBACK_CATEGORY_COLOR,
                "tables": tables_by_category.get(key, []),
            }
        )

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sourceFile": cfg.schema_sql.replace("\\", "/"),
        "tables": list(tables.values()),
        "edges": edges,
        "externalReferences": build_external_references(tables),
        "categories": categories,
    }


def write_schema_model(cfg: GeneratorsConfig, model: dict[str, Any] | None = None) -> Path:
    model = model or build_schema_model(cfg)
    out = cfg.path(cfg.schema_model)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(model, indent=2) + "\n", encoding="utf-8")
    print(
        f"schema-model.json: {len(model['tables'])} tables, "
        f"{len(model['edges'])} edges, "
        f"{len(model['externalReferences'])} external refs, "
        f"{len(model['categories'])} categories"
    )
    return out
