/** True when stdin and stdout are interactive TTYs. */
export function isInteractiveTTY(
  stdin: NodeJS.ReadStream = process.stdin,
  stdout: NodeJS.WriteStream = process.stdout,
): boolean {
  return Boolean(stdin.isTTY && stdout.isTTY);
}

/**
 * Require an interactive TTY (TUI entry). On failure writes hint to stderr and exits 1.
 */
export function requireInteractiveTTY(
  hint = "Interactive TTY required. Use the CLI (`helloworld`) for non-interactive runs.",
): void {
  if (!isInteractiveTTY()) {
    console.error(hint);
    process.exit(1);
  }
}
