import { useCallback, useEffect, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";

import { probeHealth, type HealthTargetResult } from "./api.js";
import { configPath, loadConfig, setActiveEnvironment, type UserConfig } from "./config.js";
import { SettingsTab } from "./tui/tabs/SettingsTab.js";
import { StatusTab } from "./tui/tabs/StatusTab.js";
import type { TabId, Toast } from "./tui/types.js";

export function App() {
  const { exit } = useApp();
  const [tab, setTab] = useState<TabId>("status");
  const [config, setConfig] = useState<UserConfig>(() => loadConfig());
  const [results, setResults] = useState<HealthTargetResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const refreshHealth = useCallback(async () => {
    const env = config.environments[config.environment];
    if (!env) {
      setToast({
        id: Date.now(),
        kind: "error",
        message: `Missing environment: ${config.environment}`,
      });
      return;
    }
    setLoading(true);
    try {
      const next = await probeHealth({
        apiUrl: env.apiUrl,
        workerUrl: env.workerUrl,
        apiKey: env.apiKey,
      });
      setResults(next);
    } catch (err) {
      setToast({
        id: Date.now(),
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  useEffect(() => {
    const ms = config.pollInterval * 1000;
    const id = setInterval(() => {
      void refreshHealth();
    }, ms);
    return () => clearInterval(id);
  }, [config.pollInterval, refreshHealth]);

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }
    if (input === "1") {
      setTab("status");
      return;
    }
    if (input === "2") {
      setTab("settings");
      return;
    }
    if (input === "r" && tab === "status") {
      void refreshHealth();
      return;
    }
    if (input === "e" && tab === "status") {
      const names = Object.keys(config.environments);
      if (names.length === 0) return;
      const idx = names.indexOf(config.environment);
      const nextName = names[(idx + 1) % names.length]!;
      try {
        const next = setActiveEnvironment(nextName);
        setConfig(next);
        setToast({
          id: Date.now(),
          kind: "success",
          message: `environment → ${nextName}`,
        });
      } catch (err) {
        setToast({
          id: Date.now(),
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>helloworld-tui</Text>
      <Text dimColor>[1] status [2] settings [r] refresh [e] cycle env [q] quit</Text>
      <Box marginTop={1}>
        {tab === "status" ? (
          <StatusTab environment={config.environment} results={results} loading={loading} />
        ) : (
          <SettingsTab config={config} path={configPath()} />
        )}
      </Box>
      {toast && (
        <Box marginTop={1}>
          <Text
            color={toast.kind === "error" ? "red" : toast.kind === "success" ? "green" : undefined}
          >
            {toast.message}
          </Text>
        </Box>
      )}
    </Box>
  );
}
