export const JOB_STATUS = {
  queued: "queued",
  running: "running",
  succeeded: "succeeded",
  failed: "failed",
  cancelled: "cancelled",
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const JOB_TYPE = {
  outboxDrain: "outbox.drain",
  projectionRebuild: "projection.rebuild",
  impexImport: "impex.import",
  impexExport: "impex.export",
} as const;

export function isImpexJobType(type: string): boolean {
  return type === JOB_TYPE.impexImport || type === JOB_TYPE.impexExport;
}
