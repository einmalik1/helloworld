import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const tuiRoot = fileURLToPath(new URL("..", import.meta.url));
const entry = join(tuiRoot, "dist/main.js");

describe("tui smoke", () => {
  it("exits non-zero with CLI hint when not a TTY", () => {
    const result = spawnSync(process.execPath, [entry], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Interactive TTY required/i);
    expect(result.stderr).toMatch(/helloworld/);
  });
});
