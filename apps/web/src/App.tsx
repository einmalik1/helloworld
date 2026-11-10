import { useEffect, useState } from "react";

import { Button } from "@helloworld/ui";
import { ApiKeySettings } from "@/components/ApiKeySettings";
import { fetchHealth, publicApiUrl, publicChatUrl } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function App() {
  const { data: session, isPending } = authClient.useSession();
  const [health, setHealth] = useState<string>("…");
  const [email, setEmail] = useState("dev@localhost");
  const [password, setPassword] = useState("dev-password-change-me");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchHealth<{ status?: string }>()
      .then((body) => {
        if (!cancelled) setHealth(body.status ?? "ok");
      })
      .catch(() => {
        if (!cancelled) setHealth("unreachable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signedIn = Boolean(session?.user);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Hello World</p>
        <h1 className="text-3xl font-semibold tracking-tight">Web shell</h1>
        <p className="text-muted-foreground">
          Vite + React SPA. API sessions via cookies; chat talks only to{" "}
          <code className="text-foreground">apps/chat</code>.
        </p>
      </header>

      <section className="space-y-2 rounded-md border border-border bg-muted/40 p-4 text-sm">
        <p>
          <span className="text-muted-foreground">API</span> {publicApiUrl}
        </p>
        <p>
          <span className="text-muted-foreground">Health</span> {health}
        </p>
        <p>
          <span className="text-muted-foreground">Session</span>{" "}
          {isPending ? "loading…" : session?.user?.email ?? "signed out"}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Session</h2>
        {signedIn ? (
          <Button
            variant="outline"
            onClick={() => {
              void authClient.signOut();
            }}
          >
            Sign out
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Email</span>
              <input
                className="rounded-md border border-border bg-background px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Password</span>
              <input
                type="password"
                className="rounded-md border border-border bg-background px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  void authClient.signIn
                    .email({ email, password })
                    .then(({ error }) => {
                      setAuthError(error?.message ?? null);
                    });
                }}
              >
                Sign in
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  void authClient.signUp
                    .email({ email, password, name: email })
                    .then(({ error }) => {
                      setAuthError(error?.message ?? null);
                    });
                }}
              >
                Sign up
              </Button>
            </div>
            {authError ? <p className="text-sm text-red-600">{authError}</p> : null}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">API keys</h2>
        <p className="text-sm text-muted-foreground">
          Issue or revoke Better Auth managed keys. CLI/TUI store the secret in{" "}
          <code>@helloworld/terminal/config</code> per environment — never root{" "}
          <code>.env</code>.
        </p>
        <ApiKeySettings signedIn={signedIn} />
      </section>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => window.open("/chat.html", "_self")}>Open chat</Button>
        <Button
          variant="outline"
          onClick={() => window.open(publicChatUrl, "_blank", "noopener,noreferrer")}
        >
          Chat origin
        </Button>
      </div>
    </main>
  );
}
