#!/usr/bin/env node
/**
 * Orval client codegen. Skips cleanly until apps/api/openapi.json exists
 * (produced by `pnpm --filter api openapi:export` when Nest is wired).
 * Post-processes relative imports to add `.js` for NodeNext emit.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const openapi = join(root, "../../apps/api/openapi.json");
const config = join(root, "orval.config.ts");
const generated = join(root, "src/generated");

if (!existsSync(openapi)) {
  console.log(
    "api-client: skip generate (missing apps/api/openapi.json — run openapi:export when api is wired)",
  );
  process.exit(0);
}

if (!existsSync(config)) {
  console.log("api-client: skip generate (missing orval.config.ts)");
  process.exit(0);
}

const result = spawnSync("pnpm", ["exec", "orval", "--config", "orval.config.ts"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if ((result.status ?? 1) !== 0) {
  process.exit(result.status ?? 1);
}

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith(".ts")) files.push(full);
  }
  return files;
}

/**
 * @param {string} fromFile
 * @param {string} spec
 */
function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".")) return spec;
  if (spec.endsWith(".js")) return spec;
  const base = resolve(dirname(fromFile), spec);
  if (existsSync(base) && statSync(base).isDirectory()) {
    return `${spec.replace(/\/$/, "")}/index.js`;
  }
  if (existsSync(`${base}.ts`)) return `${spec}.js`;
  return `${spec}.js`;
}

if (existsSync(generated)) {
  for (const file of walk(generated)) {
    const before = readFileSync(file, "utf8");
    const after = before.replace(
      /(from\s+['"])(\.\.?\/[^'"]+)(['"])/g,
      (_m, a, spec, b) => `${a}${resolveImport(file, spec)}${b}`,
    );
    if (after !== before) writeFileSync(file, after, "utf8");
  }
}

process.exit(0);
