import { useEffect, useState } from "react";

import { Button } from "@helloworld/ui";
import { fetchHealth, publicApiUrl, publicChatUrl } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function App() {
  const { data: session, isPending } = authClient.useSession();
  const [health, setHealth] = useState<string>("…");

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
