import { pino, type Logger } from "pino";

import type { McpConfig } from "./configuration.js";

export function createLogger(config: McpConfig): Logger {
  const pretty = config.NODE_ENV !== "production";
  return pino({
    level: config.LOG_LEVEL,
    ...(pretty
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, singleLine: true },
          },
        }
      : {}),
  });
}
