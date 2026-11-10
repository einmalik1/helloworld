import { Command } from "commander";
import {
  exitError,
  printJson,
  printResult,
} from "@helloworld/terminal/log";
import {
  loadConfig,
  resolveEnvironment,
  setEnvironmentApiKey,
} from "@helloworld/terminal/config";

import { asGlobalOpts } from "./shared.js";

type CookieJar = Map<string, string>;

function parseSetCookie(header: string | null): CookieJar {
  const jar: CookieJar = new Map();
  if (!header) return jar;
  // fetch may join multiple Set-Cookie with comma in undici; keep first segment of each pair.
  for (const part of header.split(/,(?=\s*[^;=]+=[^;]+)/)) {
    const [pair] = part.trim().split(";");
    if (!pair) continue;
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    jar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  return jar;
}

function mergeCookies(jar: CookieJar, header: string | null): void {
  for (const [k, v] of parseSetCookie(header)) {
    jar.set(k, v);
  }
}

function cookieHeader(jar: CookieJar): string {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function authFetch(
  apiUrl: string,
  path: string,
  init: RequestInit,
  jar: CookieJar,
): Promise<Response> {
  const headers = new Headers(init.headers);
  const cookie = cookieHeader(jar);
  if (cookie) headers.set("cookie", cookie);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const res = await fetch(new URL(path, apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`), {
    ...init,
    headers,
    redirect: "manual",
  });
  mergeCookies(jar, res.headers.get("set-cookie"));
  return res;
}

async function signInWithPassword(
  apiUrl: string,
  email: string,
  password: string,
  jar: CookieJar,
): Promise<void> {
  const res = await authFetch(
    apiUrl,
    "api/auth/sign-in/email",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    jar,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sign-in failed (${res.status}): ${text || res.statusText}`);
  }
}

export function registerAuthCommand(program: Command): void {
  const auth = program.command("auth").description("Better Auth key lifecycle helpers");

  const key = auth.command("key").description("Issue / revoke managed API keys");

  key
    .command("issue")
    .description("Create a Better Auth API key and store it in terminal config")
    .option("--email <email>", "Account email for session auth")
    .option("--password <password>", "Account password for session auth")
    .option("--name <name>", "Key display name", "cli")
    .action(async function issueAction(this: Command) {
      const globals = asGlobalOpts(this.optsWithGlobals());
      const opts = this.opts() as {
        email?: string;
        password?: string;
        name?: string;
      };
      try {
        if (!opts.email || !opts.password) {
          exitError(
            undefined,
            "auth key issue requires --email and --password (session-authenticated create)",
          );
        }
        const config = loadConfig();
        const { name: envName, env } = resolveEnvironment(config, globals.env);
        const jar: CookieJar = new Map();
        await signInWithPassword(env.apiUrl, opts.email, opts.password, jar);
        const res = await authFetch(
          env.apiUrl,
          "api/auth/api-key/create",
          {
            method: "POST",
            body: JSON.stringify({ name: opts.name ?? "cli" }),
          },
          jar,
        );
        const body = (await res.json()) as { key?: string; id?: string; message?: string };
        if (!res.ok || !body.key) {
          throw new Error(
            `Create API key failed (${res.status}): ${body.message ?? JSON.stringify(body)}`,
          );
        }
        setEnvironmentApiKey(envName, body.key);
        if (globals.json) {
          printJson({
            environment: envName,
            keyId: body.id,
            stored: true,
            key: body.key,
          });
        } else {
          printResult(`issued key id=${body.id ?? "?"} → environments.${envName}.apiKey`);
          printResult(`secret (copy now): ${body.key}`);
        }
      } catch (err) {
        exitError(err);
      }
    });

  key
    .command("revoke")
    .description("Revoke a Better Auth API key and clear terminal config apiKey")
    .argument("<keyId>", "API key id to delete")
    .option("--email <email>", "Account email for session auth")
    .option("--password <password>", "Account password for session auth")
    .option("--keep-local", "Do not clear environments.<env>.apiKey", false)
    .action(async function revokeAction(this: Command, keyId: string) {
      const globals = asGlobalOpts(this.optsWithGlobals());
      const opts = this.opts() as {
        email?: string;
        password?: string;
        keepLocal?: boolean;
      };
      try {
        if (!opts.email || !opts.password) {
          exitError(
            undefined,
            "auth key revoke requires --email and --password (session-authenticated delete)",
          );
        }
        const config = loadConfig();
        const { name: envName, env } = resolveEnvironment(config, globals.env);
        const jar: CookieJar = new Map();
        await signInWithPassword(env.apiUrl, opts.email, opts.password, jar);
        const res = await authFetch(
          env.apiUrl,
          "api/auth/api-key/delete",
          {
            method: "POST",
            body: JSON.stringify({ keyId }),
          },
          jar,
        );
        const body = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          message?: string;
        };
        if (!res.ok) {
          throw new Error(
            `Revoke API key failed (${res.status}): ${body.message ?? JSON.stringify(body)}`,
          );
        }
        if (!opts.keepLocal) {
          setEnvironmentApiKey(envName, undefined);
        }
        if (globals.json) {
          printJson({
            environment: envName,
            keyId,
            revoked: true,
            clearedLocal: !opts.keepLocal,
          });
        } else {
          printResult(`revoked key id=${keyId}`);
          if (!opts.keepLocal) {
            printResult(`cleared environments.${envName}.apiKey`);
          }
        }
      } catch (err) {
        exitError(err);
      }
    });
}
