import { Command } from "commander";
import { exitError, printJson, printResult } from "@helloworld/terminal/log";

import {
  configPath,
  loadConfig,
  saveConfig,
  setActiveEnvironment,
  type UserConfig,
} from "../config.js";
import { asGlobalOpts } from "./shared.js";

function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = cur[key];
    if (!next || typeof next !== "object") {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]!] = value;
}

function unsetPath(obj: Record<string, unknown>, path: string): boolean {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = cur[key];
    if (!next || typeof next !== "object") {
      return false;
    }
    cur = next as Record<string, unknown>;
  }
  const last = parts[parts.length - 1]!;
  if (!(last in cur)) {
    return false;
  }
  delete cur[last];
  return true;
}

function parseValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  const asNum = Number(raw);
  if (raw.trim() !== "" && Number.isFinite(asNum)) return asNum;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export function registerConfigCommand(program: Command): void {
  const config = program.command("config").description("Local XDG config (shared with TUI)");

  config
    .command("list")
    .description("Print resolved local config")
    .action(function listAction(this: Command) {
      const globals = asGlobalOpts(this.optsWithGlobals());
      try {
        const data = loadConfig();
        if (globals.json) {
          printJson({ path: configPath(), config: data });
        } else {
          printResult(`path: ${configPath()}`);
          printResult(JSON.stringify(data, null, 2));
        }
      } catch (err) {
        exitError(err);
      }
    });

  config
    .command("set")
    .description("Set a dotted config key (e.g. environments.local.apiUrl)")
    .argument("<key>", "Dotted key path")
    .argument("<value>", "Value (JSON or string)")
    .action(function setAction(this: Command, key: string, value: string) {
      try {
        const data = loadConfig();
        setPath(data as unknown as Record<string, unknown>, key, parseValue(value));
        saveConfig(data);
        printResult(`set ${key}`);
      } catch (err) {
        exitError(err);
      }
    });

  config
    .command("unset")
    .description("Remove a dotted config key")
    .argument("<key>", "Dotted key path")
    .action(function unsetAction(this: Command, key: string) {
      try {
        const data = loadConfig() as UserConfig;
        const ok = unsetPath(data as unknown as Record<string, unknown>, key);
        if (!ok) {
          exitError(undefined, `Key not found: ${key}`);
        }
        saveConfig(data);
        printResult(`unset ${key}`);
      } catch (err) {
        exitError(err);
      }
    });

  config
    .command("env")
    .description("Show or persist active environment name")
    .argument("[name]", "Environment to persist as active")
    .action(function envAction(this: Command, name?: string) {
      const globals = asGlobalOpts(this.optsWithGlobals());
      try {
        if (name) {
          const next = setActiveEnvironment(name);
          if (globals.json) {
            printJson({ environment: next.environment });
          } else {
            printResult(`environment: ${next.environment}`);
          }
          return;
        }
        const data = loadConfig();
        if (globals.json) {
          printJson({
            environment: globals.env ?? data.environment,
            persisted: data.environment,
            known: Object.keys(data.environments),
          });
        } else {
          printResult(`persisted: ${data.environment}`);
          if (globals.env) {
            printResult(`override (--env): ${globals.env}`);
          }
          printResult(`known: ${Object.keys(data.environments).join(", ")}`);
        }
      } catch (err) {
        exitError(err);
      }
    });
}
