import { Box, Text } from "ink";

import type { HealthTargetResult } from "../../api.js";

export function HealthBox(props: {
  environment: string;
  results: HealthTargetResult[] | null;
  loading: boolean;
}) {
  const { environment, results, loading } = props;
  return (
    <Box flexDirection="column" borderStyle="single" paddingX={1}>
      <Text bold>Health ({environment})</Text>
      {loading && <Text dimColor>checking…</Text>}
      {!loading &&
        results?.map((r) => (
          <Text key={r.target} color={r.ok ? "green" : "red"}>
            {r.target}: {r.ok ? "ok" : `fail — ${r.error ?? "error"}`}
          </Text>
        ))}
      {!loading && !results && <Text dimColor>no probes yet</Text>}
    </Box>
  );
}
