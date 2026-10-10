import { Command } from "commander";
import { exitError, printJson, printResult, withSpinner } from "@helloworld/terminal/log";

import { probeHealth } from "../api.js";
import { loadConfig, resolveEnvironment } from "../config.js";
import { asGlobalOpts } from "./shared.js";

export function registerHealthCommand(program: Command): void {
  program
    .command("health")
    .description("Probe api + worker /health in parallel")
    .action(async function healthAction(this: Command) {
      const globals = asGlobalOpts(this.optsWithGlobals());
      try {
        const config = loadConfig();
        const { name, env } = resolveEnvironment(config, globals.env);
        const results = await withSpinner(`Checking health (${name})…`, async () =>
          probeHealth({
            apiUrl: env.apiUrl,
            workerUrl: env.workerUrl,
            apiKey: env.apiKey,
          }),
        );

        const payload = { environment: name, results };
        if (globals.json) {
          printJson(payload);
        } else {
          for (const r of results) {
            printResult(
              r.ok ? `${r.target}: ok` : `${r.target}: fail — ${r.error ?? "unknown error"}`,
            );
          }
        }

        if (results.some((r) => !r.ok)) {
          process.exitCode = 1;
        }
      } catch (err) {
        exitError(err);
      }
    });
}
