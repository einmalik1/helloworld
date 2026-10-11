import { Command } from "commander";
import { setVerbose } from "@helloworld/terminal/log";

import { registerConfigCommand } from "./commands/config.js";
import { registerHealthCommand } from "./commands/health.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("helloworld")
    .description("Hello World CLI — thin client for api / worker")
    .option("--env <name>", "Environment override for this process only")
    .option("--json", "Print machine-readable JSON on stdout", false)
    .option("--verbose", "Debug logging on stderr", false)
    .hook("preAction", (thisCommand) => {
      const opts = thisCommand.optsWithGlobals() as { verbose?: boolean };
      if (opts.verbose) {
        setVerbose(true);
      }
    });

  registerHealthCommand(program);
  registerConfigCommand(program);

  return program;
}
