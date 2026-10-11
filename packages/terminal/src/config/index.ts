import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import envPaths from "env-paths";
import { z } from "zod";

export const DEFAULT_API_URL = "http://localhost:3000";
export const DEFAULT_WORKER_URL = "http://localhost:3001";

const environmentSchema = z.object({
  apiUrl: z.string().url(),
  workerUrl: z.string().url(),
  apiKey: z.string().min(1).optional(),
});

export const configSchema = z.object({
  environment: z.string().min(1).default("local"),
  environments: z.record(z.string(), environmentSchema),
  pollInterval: z.number().int().min(5).max(300).default(30),
  pageSize: z.number().int().min(5).max(100).default(15),
});

export type EnvironmentConfig = z.infer<typeof environmentSchema>;
export type UserConfig = z.infer<typeof configSchema>;

/** Absolute path to the shared CLI/TUI config file. */
export function configPath(): string {
  return join(envPaths("helloworld", { suffix: "" }).config, "config.json");
}

export function defaultConfig(): UserConfig {
  return {
    environment: "local",
    environments: {
      local: {
        apiUrl: DEFAULT_API_URL,
        workerUrl: DEFAULT_WORKER_URL,
      },
    },
    pollInterval: 30,
    pageSize: 15,
  };
}

/**
 * Load user config. Missing file → safe local defaults.
 * Corrupt / unreadable → hard error (no silent fallback).
 */
export function loadConfig(): UserConfig {
  const path = configPath();
  if (!existsSync(path)) {
    return defaultConfig();
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read config at ${path}: ${detail}`, {
      cause: err,
    });
  }

  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid config at ${path}: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function saveConfig(config: UserConfig): void {
  const path = configPath();
  const parsed = configSchema.parse(config);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
}

/**
 * Resolve active environment. `overrideEnvironment` is the CLI `--env` process override
 * and does not rewrite persisted `environment`.
 */
export function resolveEnvironment(
  config: UserConfig,
  overrideEnvironment?: string,
): { name: string; env: EnvironmentConfig } {
  const name = overrideEnvironment ?? config.environment;
  const env = config.environments[name];
  if (!env) {
    throw new Error(
      `Unknown environment "${name}". Known: ${Object.keys(config.environments).join(", ") || "(none)"}`,
    );
  }
  return { name, env };
}

/** Persist the active environment name (TUI / `config env`). */
export function setActiveEnvironment(name: string): UserConfig {
  const config = loadConfig();
  if (!config.environments[name]) {
    throw new Error(
      `Unknown environment "${name}". Known: ${Object.keys(config.environments).join(", ") || "(none)"}`,
    );
  }
  const next = { ...config, environment: name };
  saveConfig(next);
  return next;
}
