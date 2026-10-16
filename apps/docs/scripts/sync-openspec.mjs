#!/usr/bin/env node
/**
 * Publish repo openspec/ into Fumadocs content/docs with YAML frontmatter.
 * Does not modify openspec/ — generated files live under apps/docs/content/docs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "../..");
const openspecRoot = path.join(repoRoot, "openspec");
const outRoot = path.join(appRoot, "content/docs");

/** Skip WIP / non-doc trees; durable product SoT only. */
const EXCLUDE_DIR_NAMES = new Set(["changes", "schemas", "node_modules", ".git"]);

function titleFrom(body, fallback) {
  const heading = body.match(/^#\s+(.+)$/m);
  const raw = (heading ? heading[1] : fallback).trim();
  return raw.replace(/"/g, '\\"');
}

function descriptionFrom(body) {
  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith("```") || t.startsWith("|") || t.startsWith("-")) {
      continue;
    }
    return t.replace(/"/g, '\\"').slice(0, 200);
  }
  return "";
}

function shouldSkipDir(name) {
  return EXCLUDE_DIR_NAMES.has(name) || name === "generated";
}

function collectMarkdown(dir, relParts = []) {
  /** @type {{ abs: string, relParts: string[], fileName: string }[]} */
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      files.push(...collectMarkdown(abs, [...relParts, entry.name]));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!/\.mdx?$/i.test(entry.name)) continue;
    files.push({ abs, relParts, fileName: entry.name });
  }
  return files;
}

function outSlugParts(relParts, fileName) {
  const base = fileName.replace(/\.mdx?$/i, "");
  if (base.toLowerCase() === "readme") {
    return relParts.length === 0 ? ["index"] : [...relParts, "index"];
  }
  return [...relParts, base];
}

function writeMeta(dirAbs, pages) {
  const metaPath = path.join(dirAbs, "meta.json");
  const payload = {
    title: path.basename(dirAbs) === "docs" ? "OpenSpec" : path.basename(dirAbs),
    pages,
  };
  fs.writeFileSync(metaPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function main() {
  if (!fs.existsSync(openspecRoot)) {
    console.error(`openspec not found at ${openspecRoot}`);
    process.exit(1);
  }

  fs.rmSync(outRoot, { recursive: true, force: true });
  fs.mkdirSync(outRoot, { recursive: true });

  const files = collectMarkdown(openspecRoot);
  /** @type {Map<string, Set<string>>} */
  const pagesByDir = new Map();

  for (const file of files) {
    const body = fs.readFileSync(file.abs, "utf8");
    const slugParts = outSlugParts(file.relParts, file.fileName);
    const outFile = path.join(outRoot, ...slugParts.slice(0, -1), `${slugParts.at(-1)}.mdx`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });

    const fallbackTitle = slugParts.at(-1) === "index" ? "OpenSpec" : slugParts.at(-1).replace(/-/g, " ");
    const title = titleFrom(body, fallbackTitle);
    const description = descriptionFrom(body);
    const frontmatter = [
      "---",
      `title: "${title}"`,
      description ? `description: "${description}"` : null,
      "---",
      "",
    ]
      .filter((line) => line !== null)
      .join("\n");

    fs.writeFileSync(outFile, `${frontmatter}${body.trimStart()}`, "utf8");

    const parentRel = slugParts.slice(0, -1).join("/");
    const pageKey = slugParts.at(-1);
    if (!pagesByDir.has(parentRel)) pagesByDir.set(parentRel, new Set());
    pagesByDir.get(parentRel).add(pageKey);

    // Ensure intermediate dirs are tracked for meta
    for (let i = 0; i < slugParts.length - 1; i++) {
      const dirRel = slugParts.slice(0, i).join("/");
      const child = slugParts[i];
      if (!pagesByDir.has(dirRel)) pagesByDir.set(dirRel, new Set());
      pagesByDir.get(dirRel).add(child);
    }
  }

  for (const [dirRel, pages] of pagesByDir) {
    const dirAbs = dirRel ? path.join(outRoot, dirRel) : outRoot;
    if (!fs.existsSync(dirAbs)) continue;
    const ordered = [...pages].sort((a, b) => {
      if (a === "index") return -1;
      if (b === "index") return 1;
      return a.localeCompare(b);
    });
    writeMeta(dirAbs, ordered);
  }

  console.log(`Synced ${files.length} openspec markdown file(s) → ${path.relative(repoRoot, outRoot)}`);
}

main();
