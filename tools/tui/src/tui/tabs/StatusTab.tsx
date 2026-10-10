import { Box, Text } from "ink";

import type { HealthTargetResult } from "../../api.js";
import { HealthBox } from "../components/HealthBox.js";

export function StatusTab(props: {
  environment: string;
  results: HealthTargetResult[] | null;
  loading: boolean;
}) {
  return (
    <Box flexDirection="column" gap={1}>
      <Text>Status — api / worker reachability</Text>
      <HealthBox environment={props.environment} results={props.results} loading={props.loading} />
    </Box>
  );
}
