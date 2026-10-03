"""JSON → Mermaid, draw.io, erd.html (config from repo-profile generators.erd)."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from generators.config import FALLBACK_CATEGORY_COLOR, GeneratorsConfig

TEMPLATES = Path(__file__).resolve().parent / "templates"


def _cat_color(model: dict[str, Any], category: str) -> str:
    for c in model["categories"]:
        if c["key"] == category:
            return c["color"]
    return FALLBACK_CATEGORY_COLOR


def _is_audit(edge: dict[str, Any], audit_cols: set[str]) -> bool:
    return edge["fromColumn"] in audit_cols


def _mermaid_header(title: str) -> list[str]:
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES)),
        autoescape=select_autoescape(enabled_extensions=()),
    )
    return env.get_template("mermaid_header.mmd.j2").render(title=title).splitlines()


def _node_label(table: dict[str, Any]) -> str:
    label = f"{table['label']} · {len(table['columns'])} fields".replace('"', "'")
    return f'{table["name"]}["{label}"]'


def _diagram_edge(from_table: str, to_table: str, label: str, dashed: bool = False) -> str:
    line = ".." if dashed else "--"
    return f'  {from_table} ||{line}o{{ {to_table} : "{label}"'


def big_picture_mmd(model: dict[str, Any], audit_cols: set[str]) -> str:
    lines = _mermaid_header("Big Picture — all tables, business FK edges")
    lines.append("  direction LR")
    for table in model["tables"]:
        lines.append(f"  {_node_label(table)}")
    for edge in model["edges"]:
        if _is_audit(edge, audit_cols):
            continue
        lines.append(
            _diagram_edge(
                edge["toTable"],
                edge["fromTable"],
                edge["fromColumn"],
                edge["kind"] == "logical",
            )
        )
    return "\n".join(lines) + "\n"


def category_mmd(model: dict[str, Any], cat_key: str, audit_cols: set[str]) -> str:
    category = next((c for c in model["categories"] if c["key"] == cat_key), None)
    if not category:
        return ""
    by_name = {t["name"]: t for t in model["tables"]}
    members = set(category["tables"])
    lines = _mermaid_header(
        f"Category: {category['label']} ({len(category['tables'])} tables)"
    )
    lines.append("  direction LR")
    for table_name in category["tables"]:
        table = by_name.get(table_name)
        if table:
            lines.append(f"  {_node_label(table)}")
    for edge in model["edges"]:
        from_inside = edge["fromTable"] in members
        to_inside = edge["toTable"] in members
        if not from_inside and not to_inside:
            continue
        if _is_audit(edge, audit_cols):
            continue
        label = (
            edge["fromColumn"]
            if from_inside and to_inside
            else f"{edge['fromColumn']} (cross)"
        )
        lines.append(
            _diagram_edge(
                edge["toTable"],
                edge["fromTable"],
                label,
                edge["kind"] == "logical",
            )
        )
    return "\n".join(lines) + "\n"


def entity_mmd(model: dict[str, Any], name: str) -> str:
    by_name = {t["name"]: t for t in model["tables"]}
    table = by_name.get(name)
    if not table:
        return ""
    label = table["label"].replace('"', "'")
    lines = _mermaid_header(f"Entity: {table['name']} ({table['label']})")
    lines.append(f'  {table["name"]}["{label}"] {{')
    for column in table["columns"]:
        typ = re.sub(r"_+", "_", re.sub(r"[^A-Z0-9_]", "_", column["sqlType"].upper()))
        pk = " PK" if column["isPrimaryKey"] else ""
        fk = " FK" if column["references"] else ""
        lines.append(f"    {typ} {column['name']}{pk}{fk}")
    lines.append("  }")
    for edge in model["edges"]:
        if edge["fromTable"] == table["name"] or edge["toTable"] == table["name"]:
            lines.append(
                _diagram_edge(
                    edge["toTable"],
                    edge["fromTable"],
                    edge["fromColumn"],
                    edge["kind"] == "logical",
                )
            )
    return "\n".join(lines) + "\n"


def _xml_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _drawio_wrap(diagram_name: str, nodes_xml: str, edges_xml: str) -> str:
    modified = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="{modified}" agent="erd-pipeline" version="24.0.0">
  <diagram id="{diagram_name}" name="{diagram_name}">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
{nodes_xml}
{edges_xml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
"""


def _mx_node(
    id_: str,
    html_label: str,
    x: float,
    y: float,
    width: float,
    height: float,
    fill: str,
    font_color: str,
    dashed: bool = False,
) -> str:
    style = (
        f"rounded=1;whiteSpace=wrap;html=1;fillColor={fill};fontColor={font_color};"
        f"{'dashed=1;' if dashed else ''}strokeColor={'#94a3b8' if dashed else 'none'}"
    )
    return (
        f'        <mxCell id="{id_}" value="{_xml_escape(html_label)}" style="{style}" '
        f'vertex="1" parent="1">\n'
        f'          <mxGeometry x="{x}" y="{y}" width="{width}" height="{height}" as="geometry"/>\n'
        f"        </mxCell>"
    )


def _mx_edge(
    id_: str,
    source: str,
    target: str,
    label: str,
    *,
    points: list[dict[str, float]] | None = None,
    extra_style: str = "",
    dashed: bool = False,
) -> str:
    points_xml = ""
    if points:
        pts = "".join(f'<mxPoint x="{p["x"]}" y="{p["y"]}"/>' for p in points)
        points_xml = f'\n          <Array as="points">{pts}</Array>'
    style = (
        "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;fontSize=10;labelBackgroundColor=#ffffff;"
        f"{'dashed=1;strokeColor=#94a3b8;' if dashed else ''}"
        f"{extra_style + ';' if extra_style else ''}"
    )
    return (
        f'        <mxCell id="{id_}" value="{_xml_escape(label)}" style="{style}" '
        f'edge="1" parent="1" source="{source}" target="{target}">\n'
        f'          <mxGeometry relative="1" as="geometry">{points_xml}\n'
        f"          </mxGeometry>\n"
        f"        </mxCell>"
    )


def _compact_label(table: dict[str, Any]) -> str:
    return f"<b>{table['name']}</b><br>{table['label']} · {len(table['columns'])} fields"


def _humanize_fk(col: str) -> str:
    return re.sub(r"_id$", "", col).replace("_", " ")


def big_picture_drawio(model: dict[str, Any], audit_cols: set[str]) -> str:
    nodes: list[str] = []
    edges_xml: list[str] = []
    id_of = {t["name"]: f"n{i}" for i, t in enumerate(model["tables"])}
    node_w, node_h, row_h, col_w = 220, 70, 110, 260

    rows_per_cat: dict[str, int] = {}
    for table in model["tables"]:
        rows_per_cat[table["category"]] = rows_per_cat.get(table["category"], 0) + 1
    max_rows = max(rows_per_cat.values()) if rows_per_cat else 1
    row_counters: dict[str, int] = {}
    pos: dict[str, dict[str, Any]] = {}

    for i, table in enumerate(model["tables"]):
        cat_idx = next(
            (j for j, c in enumerate(model["categories"]) if c["key"] == table["category"]),
            0,
        )
        row = row_counters.get(table["category"], 0)
        row_counters[table["category"]] = row + 1
        rows = rows_per_cat.get(table["category"], 1)
        center_offset = ((max_rows - rows) / 2) * row_h
        x = cat_idx * col_w + 40
        y = row * row_h + 60 + center_offset
        pos[table["name"]] = {"x": x, "y": y, "catIdx": cat_idx, "row": row}
        nodes.append(
            _mx_node(
                id_of[table["name"]],
                _compact_label(table),
                x,
                y,
                node_w,
                node_h,
                _cat_color(model, table["category"]),
                "#ffffff",
            )
        )

    business = [e for e in model["edges"] if not _is_audit(e, audit_cols)]
    parallel: dict[str, int] = {}
    for e in business:
        key = f"{e['toTable']}->{e['fromTable']}"
        parallel[key] = parallel.get(key, 0) + 1
    seen: dict[str, int] = {}
    for edge_index, edge in enumerate(business):
        key = f"{edge['toTable']}->{edge['fromTable']}"
        group_size = parallel.get(key, 1)
        group_idx = seen.get(key, 0)
        seen[key] = group_idx + 1
        t = 0.2 + group_idx * (0.6 / (group_size - 1)) if group_size > 1 else -1
        extra = ""
        points = None
        if edge["toTable"] == edge["fromTable"]:
            p = pos.get(edge["toTable"])
            extra = "exitX=1;exitY=0.25;exitDx=0;exitDy=0;entryX=1;entryY=0.75;entryDx=0;entryDy=0"
            if p:
                points = [{"x": p["x"] + node_w + 40, "y": p["y"] + 25}]
        else:
            sp, tp = pos.get(edge["toTable"]), pos.get(edge["fromTable"])
            if sp and tp and sp["catIdx"] == tp["catIdx"] and abs(sp["row"] - tp["row"]) > 1:
                gutter_x = sp["x"] - 30
                points = [
                    {"x": gutter_x, "y": sp["y"] + 35},
                    {"x": gutter_x, "y": tp["y"] + 35},
                ]
            if t >= 0:
                extra = f"exitY={t:.2f};entryY={t:.2f};exitDx=0;exitDy=0;entryDx=0;entryDy=0"
        card = "startArrow=ERone;startFill=0;endArrow=ERmany;endFill=0"
        extra = f"{extra};{card}" if extra else card
        edges_xml.append(
            _mx_edge(
                f"e{edge_index}",
                id_of.get(edge["toTable"], ""),
                id_of.get(edge["fromTable"], ""),
                _humanize_fk(edge["fromColumn"]),
                points=points,
                extra_style=extra,
                dashed=edge["kind"] == "logical",
            )
        )
    return _drawio_wrap("erd-big-picture", "\n".join(nodes), "\n".join(edges_xml))


def category_drawio(model: dict[str, Any], cat_key: str, audit_cols: set[str]) -> str:
    category = next((c for c in model["categories"] if c["key"] == cat_key), None)
    if not category:
        return ""
    by_name = {t["name"]: t for t in model["tables"]}
    members = set(category["tables"])
    included: dict[str, dict[str, Any]] = {}
    for name in category["tables"]:
        if name in by_name:
            included[name] = by_name[name]
    for edge in model["edges"]:
        if _is_audit(edge, audit_cols):
            continue
        from_inside = edge["fromTable"] in members
        to_inside = edge["toTable"] in members
        if from_inside == to_inside:
            continue
        for table_name in (edge["fromTable"], edge["toTable"]):
            if table_name not in members and table_name not in included and table_name in by_name:
                included[table_name] = by_name[table_name]

    ordered = [
        *category["tables"],
        *[t for t in included if t not in members],
    ]
    id_of = {name: f"n{i}" for i, name in enumerate(ordered) if name in included}
    nodes: list[str] = []
    for i, table_name in enumerate(ordered):
        table = included.get(table_name)
        if not table:
            continue
        is_member = table_name in members
        col, row = i % 3, i // 3
        nodes.append(
            _mx_node(
                f"n{i}",
                _compact_label(table),
                col * 260 + 40,
                row * 120 + 60,
                220,
                70,
                _cat_color(model, table["category"]) if is_member else "#f1f5f9",
                "#ffffff" if is_member else "#475569",
                not is_member,
            )
        )

    cat_edges = [
        e
        for e in model["edges"]
        if not _is_audit(e, audit_cols)
        and e["fromTable"] in id_of
        and e["toTable"] in id_of
    ]
    edges_xml: list[str] = []
    for i, edge in enumerate(cat_edges):
        card = "startArrow=ERone;startFill=0;endArrow=ERmany;endFill=0"
        edges_xml.append(
            _mx_edge(
                f"e{i}",
                id_of[edge["toTable"]],
                id_of[edge["fromTable"]],
                _humanize_fk(edge["fromColumn"]),
                extra_style=card,
                dashed=edge["kind"] == "logical",
            )
        )
    return _drawio_wrap(f"cat-{cat_key}", "\n".join(nodes), "\n".join(edges_xml))


def entity_drawio(model: dict[str, Any], name: str) -> str:
    by_name = {t["name"]: t for t in model["tables"]}
    table = by_name.get(name)
    if not table:
        return ""
    neighbors: list[dict[str, Any]] = []
    seen = {name}
    rel_edges: list[dict[str, Any]] = []
    for edge in model["edges"]:
        if edge["fromTable"] != name and edge["toTable"] != name:
            continue
        rel_edges.append(
            {
                "from": edge["fromTable"],
                "to": edge["toTable"],
                "column": edge["fromColumn"],
                "dashed": edge["kind"] == "logical",
            }
        )
        for table_name in (edge["fromTable"], edge["toTable"]):
            if table_name in seen:
                continue
            seen.add(table_name)
            related = by_name.get(table_name)
            if related:
                neighbors.append(related)

    id_of = {"main": "main"}
    for i, nb in enumerate(neighbors):
        id_of[nb["name"]] = f"nb{i}"
    field_lines = "<br>".join(
        f"PK {c['name']}" if c["isPrimaryKey"] else c["name"] for c in table["columns"]
    )
    main_height = 40 + len(table["columns"]) * 16
    nodes = [
        _mx_node(
            "main",
            f"<b>{table['name']}</b><br>{field_lines}",
            40,
            40,
            280,
            main_height,
            _cat_color(model, table["category"]),
            "#ffffff",
        )
    ]
    y = 40
    for nb in neighbors:
        nodes.append(
            _mx_node(
                id_of[nb["name"]],
                _compact_label(nb),
                480,
                y,
                200,
                70,
                "#f1f5f9",
                "#475569",
                True,
            )
        )
        y += 120
    edges_xml = []
    for i, edge in enumerate(rel_edges):
        card = "startArrow=ERone;startFill=0;endArrow=ERmany;endFill=0"
        edges_xml.append(
            _mx_edge(
                f"e{i}",
                id_of.get(edge["to"], ""),
                id_of.get(edge["from"], ""),
                _humanize_fk(f"{edge['from']}.{edge['column']}"),
                extra_style=card,
                dashed=edge["dashed"],
            )
        )
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", name)
    return _drawio_wrap(f"ent-{safe}", "\n".join(nodes), "\n".join(edges_xml))


def _category_css(model: dict[str, Any]) -> tuple[str, str]:
    vars_lines = []
    class_lines = []
    for category in model["categories"]:
        safe = re.sub(r"[^a-zA-Z0-9_-]", "-", category["key"])
        vars_lines.append(f"    --cat-{safe}: {category['color']};")
        class_lines.append(f"  .cat-{safe} {{ color: var(--cat-{safe}); }}")
    return "\n".join(vars_lines), "\n".join(class_lines)


def _simple_md_to_html(md: str) -> str:
    """Minimal markdown → HTML for optional nicht-crud tab (headings, paragraphs, lists)."""
    if not md.strip():
        return ""
    lines = md.split("\n")
    out: list[str] = []
    in_ul = False
    for line in lines:
        if line.startswith("# "):
            if in_ul:
                out.append("</ul>")
                in_ul = False
            out.append(f"<h1>{escape(line[2:])}</h1>")
        elif line.startswith("## "):
            if in_ul:
                out.append("</ul>")
                in_ul = False
            out.append(f"<h2>{escape(line[3:])}</h2>")
        elif line.startswith("- "):
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{escape(line[2:])}</li>")
        elif not line.strip():
            if in_ul:
                out.append("</ul>")
                in_ul = False
        else:
            if in_ul:
                out.append("</ul>")
                in_ul = False
            out.append(f"<p>{escape(line)}</p>")
    if in_ul:
        out.append("</ul>")
    return "\n".join(out)


def write_erd_html(
    cfg: GeneratorsConfig,
    model: dict[str, Any],
    out_dir: Path,
    diagrams: dict[str, Any],
    audit_cols: set[str],
) -> None:
    css_vars, css_classes = _category_css(model)
    stats = {
        "tableCount": len(model["tables"]),
        "columnCount": sum(len(t["columns"]) for t in model["tables"]),
        "fkCount": len(model["edges"]),
        "sfRefCount": len(model["externalReferences"]),
        "categoryCount": len(model["categories"]),
        "businessEdgeCount": sum(1 for e in model["edges"] if not _is_audit(e, audit_cols)),
        "auditEdgeCount": sum(1 for e in model["edges"] if _is_audit(e, audit_cols)),
        "logicalEdgeCount": sum(1 for e in model["edges"] if e["kind"] == "logical"),
    }
    nicht_path = None
    if cfg.erd.nicht_crud_katalog:
        candidate = cfg.path(cfg.erd.nicht_crud_katalog)
        if candidate.is_file():
            nicht_path = candidate
    nicht_html = _simple_md_to_html(nicht_path.read_text(encoding="utf-8")) if nicht_path else ""
    template = (TEMPLATES / "viewer.html").read_text(encoding="utf-8")
    html = (
        template.replace("{{MODEL}}", json.dumps(model))
        .replace("{{STATS}}", json.dumps(stats))
        .replace("{{DIAGRAMS}}", json.dumps(diagrams))
        .replace("{{SFREFS}}", json.dumps(model["externalReferences"]))
        .replace("{{NICHT_CRUD_HTML}}", json.dumps(nicht_html))
        .replace(
            "{{NICHT_CRUD_SOURCE}}",
            cfg.erd.nicht_crud_katalog or "",
        )
        .replace("{{BUSINESS_DESCRIPTIONS}}", json.dumps({}))
        .replace("{{BUSINESS_DESCRIPTIONS_SHORT}}", json.dumps({}))
        .replace("{{CATEGORY_CSS_VARS}}", css_vars)
        .replace("{{CATEGORY_CSS_CLASSES}}", css_classes)
    )
    (out_dir / "erd.html").write_text(html, encoding="utf-8")


def generate_erd(cfg: GeneratorsConfig, model: dict[str, Any]) -> None:
    if not cfg.erd.enabled:
        print("erd: skipped (disabled in repo-profile)")
        return
    out_dir = cfg.path(cfg.erd.out_dir)
    audit_cols = set(cfg.erd.audit_fk_columns)
    (out_dir / "categories").mkdir(parents=True, exist_ok=True)
    (out_dir / "entities").mkdir(parents=True, exist_ok=True)

    big_mmd = big_picture_mmd(model, audit_cols)
    (out_dir / "big-picture.mmd").write_text(big_mmd, encoding="utf-8")
    (out_dir / "erd.drawio").write_text(big_picture_drawio(model, audit_cols), encoding="utf-8")

    category_mmds: dict[str, str] = {}
    for category in model["categories"]:
        key = category["key"]
        mmd = category_mmd(model, key, audit_cols)
        category_mmds[key] = mmd
        (out_dir / "categories" / f"{key}.mmd").write_text(mmd, encoding="utf-8")
        (out_dir / "categories" / f"{key}.drawio").write_text(
            category_drawio(model, key, audit_cols), encoding="utf-8"
        )

    entity_mmds: dict[str, str] = {}
    for table in model["tables"]:
        name = table["name"]
        mmd = entity_mmd(model, name)
        entity_mmds[name] = mmd
        (out_dir / "entities" / f"{name}.mmd").write_text(mmd, encoding="utf-8")
        (out_dir / "entities" / f"{name}.drawio").write_text(
            entity_drawio(model, name), encoding="utf-8"
        )

    diagrams = {"big": big_mmd, "categories": category_mmds, "entities": entity_mmds}
    write_erd_html(cfg, model, out_dir, diagrams, audit_cols)
    print(
        f"erd/: big-picture.mmd, {len(model['categories'])} category diagrams, "
        f"{len(model['tables'])} entity diagrams, erd.drawio, erd.html"
    )
