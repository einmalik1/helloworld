import { render } from "ink";
import { requireInteractiveTTY } from "@helloworld/terminal/tty";

import { App } from "./app.js";

requireInteractiveTTY(
  "Interactive TTY required. Use the CLI (`helloworld`) for non-interactive runs.",
);

render(<App />, { exitOnCtrlC: false });
