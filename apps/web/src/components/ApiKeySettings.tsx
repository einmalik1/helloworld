import { useCallback, useEffect, useState } from "react";

import { Button } from "@helloworld/ui";
import { authClient } from "@/lib/auth-client";

type ApiKeyRow = {
  id: string;
  name?: string | null;
  start?: string | null;
  createdAt?: string | Date;
};

export function ApiKeySettings({ signedIn }: { signedIn: boolean }) {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [name, setName] = useState("cli");
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!signedIn) {
      setKeys([]);
      return;
    }
    const { data, error: listError } = await authClient.apiKey.list({});
    if (listError) {
      setError(listError.message ?? "Failed to list API keys");
      return;
    }
    const rows = Array.isArray(data)
      ? data
      : ((data as { apiKeys?: ApiKeyRow[] } | null)?.apiKeys ?? []);
    setKeys(rows);
    setError(null);
  }, [signedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!signedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to issue or revoke managed API keys for CLI/TUI.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Key name</span>
          <input
            className="rounded-md border border-border bg-background px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <Button
          disabled={busy}
          onClick={() => {
            setBusy(true);
            setIssuedKey(null);
            void authClient.apiKey
              .create({ name: name || "cli" })
              .then(({ data, error: createError }) => {
                if (createError) {
                  setError(createError.message ?? "Failed to create API key");
                  return;
                }
                const key =
                  data && typeof data === "object" && "key" in data
                    ? String((data as { key?: string }).key ?? "")
                    : "";
                setIssuedKey(key || null);
                setError(null);
                return refresh();
              })
              .finally(() => setBusy(false));
          }}
        >
          Issue key
        </Button>
      </div>

      {issuedKey ? (
        <p className="break-all rounded-md border border-border bg-muted/40 p-3 text-xs">
          Copy now (shown once): <code>{issuedKey}</code>
          <br />
          Store via CLI:{" "}
          <code>helloworld config set environments.&lt;env&gt;.apiKey …</code> or{" "}
          <code>helloworld auth key issue</code>
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ul className="space-y-2 text-sm">
        {keys.length === 0 ? (
          <li className="text-muted-foreground">No API keys yet.</li>
        ) : (
          keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
              <span>
                {key.name ?? "(unnamed)"}{" "}
                <code className="text-xs text-muted-foreground">{key.id}</code>
              </span>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  void authClient.apiKey
                    .delete({ keyId: key.id })
                    .then(({ error: deleteError }) => {
                      if (deleteError) {
                        setError(deleteError.message ?? "Failed to revoke key");
                        return;
                      }
                      setError(null);
                      return refresh();
                    })
                    .finally(() => setBusy(false));
                }}
              >
                Revoke
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
