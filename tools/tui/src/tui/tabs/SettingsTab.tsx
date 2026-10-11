import { Box, Text } from "ink";

import type { UserConfig } from "../../config.js";

export function SettingsTab(props: { config: UserConfig; path: string }) {
  const { config, path } = props;
  const env = config.environments[config.environment];
  return (
    <Box flexDirection="column" gap={1}>
      <Text>Settings — local XDG config</Text>
      <Text dimColor>{path}</Text>
      <Text>environment: {config.environment}</Text>
      <Text>pollInterval: {config.pollInterval}s</Text>
      <Text>pageSize: {config.pageSize}</Text>
      {env && (
        <>
          <Text>apiUrl: {env.apiUrl}</Text>
          <Text>workerUrl: {env.workerUrl}</Text>
          <Text>apiKey: {env.apiKey ? "(set)" : "(none)"}</Text>
        </>
      )}
      <Text dimColor>Tip: use `helloworld config set …` or cycle env with `e` on Status.</Text>
    </Box>
  );
}
