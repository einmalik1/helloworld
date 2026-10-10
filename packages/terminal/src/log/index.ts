/**
 * CLI/TUI diagnostics and spinners — not Pino.
 *
 * - **tslog** (pretty) → stderr (so stdout stays free for results / `--json`)
 * - **ora** → stderr (same stream; logs while spinning are OK)
 * - **stdout** helpers for command results only
 */
import ora, { type Ora, type Options as OraOptions } from "ora";
import { Logger, type ILogObj } from "tslog";

export type { Ora, OraOptions };

const toStderr = (...args: unknown[]) => {
  console.error(...args);
};

export type CreateLoggerOptions = {
  /** Logger name / prefix (default `helloworld`) */
  name?: string;
  /** When true, emit DEBUG (and above); otherwise INFO+ */
  verbose?: boolean;
};

/** Pretty tslog instance writing diagnostics to stderr. */
export function createLogger(options: CreateLoggerOptions = {}): Logger<ILogObj> {
  return new Logger<ILogObj>({
    name: options.name ?? "helloworld",
    minLevel: options.verbose ? "DEBUG" : "INFO",
    type: "pretty",
    pretty: {
      // Route all levels to stderr — keep stdout for results / --json
      levelMethod: {
        "*": toStderr,
      },
    },
  });
}

/** Shared default logger for tools (override via `createLogger` when needed). */
export const log = createLogger();

/** Raise/lower verbosity on the shared `log` instance (e.g. after parsing `--verbose`). */
export function setVerbose(verbose: boolean): void {
  log.setMinLevel(verbose ? "DEBUG" : "INFO");
}

/** Command result text → stdout (always a trailing newline). */
export function printResult(text: string): void {
  process.stdout.write(text.endsWith("\n") ? text : `${text}\n`);
}

/** Machine-readable result → stdout. */
export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/** Ora spinner on stderr (same stream as `log` — safe to log while spinning). */
export function spinner(text: string, options?: OraOptions): Ora {
  return ora({ text, stream: process.stderr, ...options });
}

/**
 * Run async work under an ora spinner.
 * Succeeds on resolve; fails on throw (error is rethrown).
 */
export async function withSpinner<T>(
  text: string,
  fn: (spin: Ora) => Promise<T>,
  options?: OraOptions,
): Promise<T> {
  const spin = spinner(text, options).start();
  try {
    const result = await fn(spin);
    if (spin.isSpinning) {
      spin.succeed();
    }
    return result;
  } catch (err) {
    if (spin.isSpinning) {
      spin.fail();
    }
    throw err;
  }
}

export function exitOk(): never {
  process.exit(0);
}

export function exitError(err?: unknown, message?: string): never {
  if (message && err !== undefined) {
    log.error(message, err);
  } else if (message) {
    log.error(message);
  } else if (err instanceof Error) {
    log.error(err.message, err);
  } else if (err !== undefined) {
    log.error(String(err));
  }
  process.exit(1);
}
