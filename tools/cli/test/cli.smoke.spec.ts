import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const cliRoot = fileURLToPath(new URL("..", import.meta.url));
const entry = join(cliRoot, "dist/cli.js");

function runCli(args: string[], env: NodeJS.ProcessEnv) {
  return spawnSync(process.execPath, [entry, ...args], {
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

describe("cli smoke", () => {
  it("config list prints defaults under temp XDG_CONFIG_HOME", () => {
    const xdg = mkdtempSync(join(tmpdir(), "hw-cli-smoke-"));
    const result = runCli(["--json", "config", "list"], {
      XDG_CONFIG_HOME: xdg,
    });
    expect(result.status, result.stderr).toBe(0);
    const payload = JSON.parse(result.stdout) as {
      config: { environment: string; environments: { local: { apiUrl: string } } };
    };
    expect(payload.config.environment).toBe("local");
    expect(payload.config.environments.local.apiUrl).toBe("http://localhost:3000");
  });

  it("config env persists active environment", () => {
    const xdg = mkdtempSync(join(tmpdir(), "hw-cli-smoke-"));
    const configDir = join(xdg, "helloworld");
    writeFileSync(
      join(xdg, ".keep"),
      "", // ensure dir exists for env-paths parent
    );
    void configDir;
    const set = runCli(["config", "env", "local"], { XDG_CONFIG_HOME: xdg });
    expect(set.status, set.stderr).toBe(0);
    const listed = runCli(["--json", "config", "env"], {
      XDG_CONFIG_HOME: xdg,
    });
    expect(listed.status, listed.stderr).toBe(0);
    const payload = JSON.parse(listed.stdout) as { persisted: string };
    expect(payload.persisted).toBe("local");
  });
});
