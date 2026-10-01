/**
 * ERD-Pipeline Step 1: spec/erd/schema.sql → spec/erd/generated/schema-model.json
 *
 * Parst das handgeschriebene PostgreSQL-DDL in eine strukturierte Transfer-Datei.
 * Diese JSON ist die Grundlage für Step 2 (generate-diagrams.ts); das SQL bleibt
 * die Single Source of Truth — dieses Skript erfindet nichts, es extrahiert nur.
 *
 * Parser-Annahmen (in schema.sql dokumentiert):
 *   - Ein Statement pro Semikolon, Statements mehrzeilig
 *   - Spalten und Constraints je eine Zeile pro Element
 *   - COMMENT ON TABLE '...' IS 'category: … | label: … | spec: … | desc: …'
 *   - COMMENT ON COLUMN liefert Feldbeschreibungen
 *   - CREATE INDEX / CREATE UNIQUE INDEX (inkl. Partial Indexes mit WHERE)
 *
 * Usage: pnpm exec tsx spark/scripts/erd/parse-schema.ts
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCHEMA_PATH = join(REPO_ROOT, "spec", "erd", "schema.sql");
const OUT_PATH = join(REPO_ROOT, "spec", "erd", "generated", "schema-model.json");

interface Column {
  name: string;
  sqlType: string;
  logicalType: string;
  nullable: boolean;
  hasDefault: boolean;
  defaultValue: string | null;
  references: { table: string; column: string; onDelete: string | null } | null;
  /** Logische Referenz aus dem COMMENT-Text — bewusst kein FOREIGN KEY (04 §5, 06 §6). */
  logicalReference: { table: string; column: string } | null;
  isPrimaryKey: boolean;
  comment: string | null;
}

export interface TableIndex {
  name: string;
  columns: string[];
  unique: boolean;
  partial: string | null;
}

export interface Table {
  name: string;
  category: string;
  label: string;
  spec: string;
  description: string;
  columns: Column[];
  primaryKey: string[];
  uniqueConstraints: { name: string; columns: string[] }[];
  checkConstraints: { name: string; definition: string }[];
  indexes: TableIndex[];
  foreignKeys: { column: string; references: string; onDelete: string | null }[];
}

export interface Edge {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  kind: "fk" | "logical";
  onDelete: string | null;
}

/** Salesforce-Referenz-Kanten: char(18)-Spalten, die per Namenskonvention auf SF zeigen. */
export interface ExternalReference {
  table: string;
  column: string;
  sfObject: string;
}

export interface SchemaModel {
  generatedAt: string;
  sourceFile: string;
  tables: Table[];
  edges: Edge[];
  externalReferences: ExternalReference[];
  categories: { key: string; label: string; color: string; tables: string[] }[];
}

function readStatements(sql: string): string[] {
  const withoutComments = sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");
  // Semikolons innerhalb von String-Literalen ('...') trennen nicht —
  // deutsche COMMENT-Texte enthalten welche.
  const statements: string[] = [];
  let current = "";
  let inString = false;
  for (let i = 0; i < withoutComments.length; i += 1) {
    const ch = withoutComments[i];
    if (ch === "'") inString = !inString;
    if (ch === ";" && !inString) {
      if (current.trim()) statements.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

function parseCreateTable(stmt: string): Table | null {
  const match = /^CREATE TABLE (?:"([^"]+)"|([a-z_][a-z0-9_]*)) \(([\s\S]*)\)$/m.exec(
    stmt.replace(/\s+/g, " "),
  );
  if (!match) return null;
  const tableName = match[1] ?? match[2];
  const body = match[3];

  const table: Table = {
    name: tableName,
    category: "uncategorized",
    label: tableName,
    spec: "",
    description: "",
    columns: [],
    primaryKey: [],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: [],
    foreignKeys: [],
  };

  // Body in Elemente zerlegen: Zeilen, aber Klammern in CHECK/Default-Werten bleiben zusammen.
  const elements: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of body) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      elements.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) elements.push(current.trim());

  for (const element of elements) {
    if (/^PRIMARY KEY \((.+)\)$/i.test(element)) {
      table.primaryKey = parseColumnList(element.replace(/^PRIMARY KEY \((.+)\)$/i, "$1"));
      continue;
    }
    if (/^CONSTRAINT .+ UNIQUE \((.+)\)$/i.test(element)) {
      const name = /^CONSTRAINT (\S+)/i.exec(element)?.[1] ?? "";
      table.uniqueConstraints.push({
        name,
        columns: parseColumnList(element.replace(/^CONSTRAINT \S+ UNIQUE \((.+)\)$/i, "$1")),
      });
      continue;
    }
    if (/^CONSTRAINT .+ CHECK \(/i.test(element)) {
      const name = /^CONSTRAINT (\S+)/i.exec(element)?.[1] ?? "";
      table.checkConstraints.push({ name, definition: element });
      continue;
    }
    if (/^UNIQUE \((.+)\)$/i.test(element)) {
      table.uniqueConstraints.push({
        name: `${tableName}_unique`,
        columns: parseColumnList(element.replace(/^UNIQUE \((.+)\)$/i, "$1")),
      });
      continue;
    }
    if (/^CHECK \(/i.test(element)) {
      table.checkConstraints.push({ name: `${tableName}_check`, definition: element });
      continue;
    }
    if (/^FOREIGN KEY/i.test(element)) continue; // Inline-Syntax nicht verwendet

    const column = parseColumn(element);
    if (column) {
      table.columns.push(column);
      if (column.isPrimaryKey) table.primaryKey.push(column.name);
      if (column.references) {
        table.foreignKeys.push({
          column: column.name,
          references: `${column.references.table}.${column.references.column}`,
          onDelete: column.references.onDelete,
        });
      }
    }
  }
  return table;
}

function parseColumnList(raw: string): string[] {
  // Kommas innerhalb von Klammern (z. B. Composite-PK) auseinanderhalten
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of raw) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current.trim().replace(/"/g, ""));
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim().replace(/"/g, ""));
  return parts;
}

function parseColumn(element: string): Column | null {
  const nameMatch = /^"?([a-z_][a-z0-9_]*)"?\s+(.+)$/i.exec(element);
  if (!nameMatch) return null;
  const name = nameMatch[1];
  const rest = nameMatch[2];

  // REFERENCES-Klausel extrahieren (kann mittendrin stehen)
  let onDelete: string | null = null;
  let references: Column["references"] = null;
  const refMatch =
    /REFERENCES "?([a-z_][a-z0-9_]*)"?\s*\(\s*"?([a-z_][a-z0-9_]*)"?\s*\)(\s+ON DELETE (CASCADE|SET NULL|RESTRICT|NO ACTION))?/i.exec(
      rest,
    );
  if (refMatch) {
    references = { table: refMatch[1], column: refMatch[2], onDelete: null };
    if (refMatch[4]) onDelete = refMatch[4] === "NO ACTION" ? null : refMatch[4];
    references.onDelete = onDelete;
  }

  const isPrimaryKey =
    /\bPRIMARY KEY\b/i.test(rest) || (name === "id" && /\bPRIMARY KEY\b/i.test(rest));
  const nullable = !/\bNOT NULL\b/i.test(rest);
  const defaultMatch = /\bDEFAULT\s+([^,\s]+)/i.exec(rest);
  const sqlType = extractSqlType(rest);

  return {
    name,
    sqlType,
    logicalType: mapLogicalType(sqlType),
    nullable,
    hasDefault: defaultMatch !== null,
    defaultValue: defaultMatch?.[1] ?? null,
    references,
    logicalReference: null,
    isPrimaryKey,
    comment: null,
  };
}

/**
 * Logische Referenzen aus COMMENT-Texten: die Spec hält diese Beziehungen
 * bewusst ohne FOREIGN KEY (04 §5, 06 §6 — "neue Typen sind ein Insert,
 * keine Migration"). Drei dokumentierte Muster:
 *   1. "logische Referenz auf team_role.key (06 §3)"         → team_role.key
 *   2. "referenziert picklist_value.value_key (logisch, …)"  → picklist_value.value_key
 *   3. "logische Referenz auf das benannte Objekt: opportunity" → opportunity.id
 * Erkannt wird nur, wenn die genannte Tabelle auch existiert — sonst wäre es
 * ein Prosa-Wort und keine Referenz.
 */
function extractLogicalReference(
  comment: string,
  existingTables: Set<string>,
): Column["logicalReference"] {
  const pattern1 = /logische[rn]? Referenz auf ([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)/i.exec(
    comment,
  );
  const pattern2 = /referenziert ([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)\s*\(logisch/i.exec(comment);
  // Kein $-Anker: der Kommentar endet mit der Spec-Referenz "(05 §7.1)".
  const pattern3 =
    /logische[rn]? Referenz auf (?:das|die|den)? ?[a-zäöüß ]*?: ?([a-z_][a-z0-9_]*)/i.exec(comment);
  const named = pattern1 ?? pattern2;
  if (named) {
    const [, table, column] = named;
    if (!existingTables.has(table)) return null;
    return { table, column };
  }
  if (pattern3) {
    const table = pattern3[1];
    if (!existingTables.has(table)) return null;
    return { table, column: "id" };
  }
  return null;
}

function extractSqlType(rest: string): string {
  // Typ bis zum ersten Constraint-Schlüsselwort; Klammern bleiben erhalten
  const stop = /\s+(NOT NULL|NULL|DEFAULT|PRIMARY KEY|REFERENCES|CONSTRAINT|UNIQUE|CHECK)\b/i.exec(
    rest,
  );
  const raw = stop ? rest.slice(0, stop.index) : rest;
  return raw.trim().replace(/\s+/g, " ");
}

function mapLogicalType(sqlType: string): string {
  const t = sqlType.toLowerCase();
  if (t === "uuid") return "UUID";
  if (t === "citext" || t.startsWith("varchar") || t === "text") return "Text";
  if (t === "char(3)" || t === "char(18)") return t === "char(3)" ? "ISO currency" : "External ID (18)";
  if (t === "bigint" || t === "integer" || t === "smallint") return "Integer";
  if (t === "boolean") return "Boolean";
  if (t === "date") return "Date";
  if (t === "timestamptz") return "Timestamp (TZ)";
  if (t === "inet") return "IP address";
  if (t === "jsonb") return "JSON";
  if (t.endsWith("[]")) return "Array";
  return sqlType;
}

function parseIndex(stmt: string, tables: Map<string, Table>): void {
  const match =
    /^CREATE (UNIQUE )?INDEX (?:IF NOT EXISTS )?([a-z_][a-z0-9_]*) ON (?:"([^"]+)"|([a-z_][a-z0-9_]*)) \((.+?)\)( WHERE (.+))?$/i.exec(
      stmt.replace(/\s+/g, " ").trim(),
    );
  if (!match) return;
  const unique = Boolean(match[1]);
  const name = match[2];
  const tableName = match[3] ?? match[4];
  const columns = parseColumnList(match[5]);
  const partial = match[7] ?? null;

  const table = tables.get(tableName);
  if (!table) return;
  // Unique-Index, der kein Constraint-Duplikat ist, zusätzlich als Unique-Constraint melden
  if (unique) {
    table.uniqueConstraints.push({ name: `${name} (Index)`, columns });
  }
  table.indexes.push({ name, columns, unique, partial });
}

function parseCommentOn(
  stmt: string,
  model: { tables: Map<string, Table>; existingTables: Set<string> },
): void {
  const match = /^COMMENT ON TABLE (?:"([^"]+)"|([a-z_][a-z0-9_]*)) IS '(.*)'$/m.exec(
    stmt.replace(/\s+/g, " ").trim(),
  );
  if (match) {
    const tableName = match[1] ?? match[2];
    const table = model.tables.get(tableName);
    if (!table) return;
    const parts = match[3].split(" | ").map((p) => p.trim());
    for (const part of parts) {
      const [key, ...value] = part.split(": ");
      const val = value.join(": ");
      if (key === "category") table.category = val;
      else if (key === "label") table.label = val;
      else if (key === "spec") table.spec = val;
      else if (key === "desc") table.description = val;
    }
    return;
  }
  const colMatch =
    /^COMMENT ON COLUMN (?:"([^"]+)"|([a-z_][a-z0-9_]*))\.([a-z_][a-z0-9_]*) IS '(.*)'$/m.exec(
      stmt.replace(/\s+/g, " ").trim(),
    );
  if (colMatch) {
    const tableName = colMatch[1] ?? colMatch[2];
    const columnName = colMatch[3];
    const comment = colMatch[4];
    const table = model.tables.get(tableName);
    const column = table?.columns.find((c) => c.name === columnName);
    if (column) {
      column.comment = comment;
      column.logicalReference = extractLogicalReference(comment, model.existingTables);
    }
  }
}

function buildExternalReferences(tables: Map<string, Table>): ExternalReference[] {
  const refs: ExternalReference[] = [];
  for (const table of tables.values()) {
    for (const column of table.columns) {
      // Konvention (01 §3): *_sf_id referenziert Salesforce, salesforce_id = Shadow-Record
      const isSfId = /_sf_id$/.test(column.name) || column.name === "salesforce_id";
      if (isSfId && column.sqlType === "char(18)") {
        let sfObject = "Salesforce";
        if (column.name.startsWith("account_")) sfObject = "Account";
        else if (column.name.startsWith("contact_")) sfObject = "Contact";
        else if (column.name.startsWith("campaign_")) sfObject = "Campaign";
        else if (column.name.startsWith("partner_account_")) sfObject = "Partner Account";
        else if (column.name.startsWith("competitor_account_")) sfObject = "Account (Wettbewerber)";
        else if (column.name === "salesforce_id") sfObject = "Salesforce (Shadow)";
        else if (column.name === "contract_sf_id") sfObject = "Contract";
        refs.push({ table: table.name, column: column.name, sfObject });
      }
    }
  }
  return refs;
}

const FALLBACK_CATEGORY_COLOR = "#64748b";

/**
 * Kategorie-Metadaten aus dem Schema-Header:
 *   -- @category auth | label: Auth | color: #dc2626
 *
 * Muss vor dem Statement-Split gelesen werden — `--`-Zeilen fliegen sonst weg.
 * label und color sind optional; fehlende Werte fallen auf key bzw. Slate-Grau.
 */
function parseCategoryDirectives(
  sql: string,
): { order: string[]; defs: Map<string, { label: string; color: string }> } {
  const order: string[] = [];
  const defs = new Map<string, { label: string; color: string }>();
  for (const line of sql.split("\n")) {
    const match = /^\s*--\s*@category\s+(\S+)\s*(?:\|\s*(.+))?$/.exec(line);
    if (!match) continue;
    const key = match[1];
    let label = key;
    let color = FALLBACK_CATEGORY_COLOR;
    if (match[2]) {
      for (const part of match[2].split(" | ").map((p) => p.trim())) {
        const [rawKey, ...valueParts] = part.split(": ");
        const val = valueParts.join(": ").trim();
        if (rawKey === "label" && val) label = val;
        else if (rawKey === "color" && val) color = val;
      }
    }
    if (!defs.has(key)) order.push(key);
    defs.set(key, { label, color });
  }
  return { order, defs };
}

function main(): void {
  const sql = readFileSync(SCHEMA_PATH, "utf-8");
  const { order: categoryOrder, defs: categoryDefs } = parseCategoryDirectives(sql);
  const statements = readStatements(sql);

  const tables = new Map<string, Table>();
  const edges: Edge[] = [];
  const commentStatements: string[] = [];

  // Pass 1: Struktur (CREATE TABLE, CREATE INDEX) — muss vor den Kommentaren
  // stehen, weil COMMENT ON vor dem zugehörigen CREATE TABLE im SQL stehen darf.
  for (const stmt of statements) {
    if (/^CREATE TABLE /i.test(stmt)) {
      const table = parseCreateTable(stmt);
      if (table) tables.set(table.name, table);
    } else if (/^CREATE (UNIQUE )?INDEX /i.test(stmt)) {
      parseIndex(stmt, tables);
    } else if (/^COMMENT ON /i.test(stmt)) {
      commentStatements.push(stmt);
    }
    // CREATE EXTENSION und künftige andere Statements werden ignoriert.
  }

  // Pass 2: Kommentare — alle Tabellen existieren jetzt.
  const existingTables = new Set(tables.keys());
  for (const stmt of commentStatements) {
    parseCommentOn(stmt, { tables, existingTables });
  }

  for (const table of tables.values()) {
    for (const fk of table.foreignKeys) {
      const [toTable, toColumn] = fk.references.split(".");
      edges.push({
        fromTable: table.name,
        fromColumn: fk.column,
        toTable,
        toColumn,
        kind: "fk",
        onDelete: fk.onDelete,
      });
    }
  }

  // Logische Kanten aus den COMMENT-Referenzen (Pass 2 füllt logicalReference).
  for (const table of tables.values()) {
    for (const column of table.columns) {
      const ref = column.logicalReference;
      if (!ref) continue;
      edges.push({
        fromTable: table.name,
        fromColumn: column.name,
        toTable: ref.table,
        toColumn: ref.column,
        kind: "logical",
        onDelete: null,
      });
    }
  }

  const externalReferences = buildExternalReferences(tables);

  const tablesByCategory = new Map<string, string[]>();
  for (const table of tables.values()) {
    const list = tablesByCategory.get(table.category) ?? [];
    list.push(table.name);
    tablesByCategory.set(table.category, list);
  }

  // Deklarierte Kategorien zuerst (Reihenfolge der @category-Zeilen), danach
  // unbekannte Keys aus den Tabellen — jeweils mit Label/Farbe aus dem Header.
  const seen = new Set<string>();
  const categories: SchemaModel["categories"] = [];
  for (const key of [...categoryOrder, ...tablesByCategory.keys()]) {
    if (seen.has(key)) continue;
    seen.add(key);
    const def = categoryDefs.get(key);
    categories.push({
      key,
      label: def?.label ?? key,
      color: def?.color ?? FALLBACK_CATEGORY_COLOR,
      tables: tablesByCategory.get(key) ?? [],
    });
  }

  const model: SchemaModel = {
    generatedAt: new Date().toISOString(),
    sourceFile: "spec/erd/schema.sql",
    tables: [...tables.values()],
    edges,
    externalReferences,
    categories,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(model, null, 2)}\n`);

  const fkCount = edges.length;
  const sfRefCount = externalReferences.length;
  console.log(
    `schema-model.json: ${tables.size} tables, ${fkCount} FK edges, ${sfRefCount} external refs, ${model.categories.length} categories`,
  );
}

main();
