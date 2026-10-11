import { exitError } from "@helloworld/terminal/log";

import { createProgram } from "./commands.js";

const program = createProgram();

try {
  await program.parseAsync(process.argv);
} catch (err) {
  exitError(err);
}
