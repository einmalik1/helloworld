export const IMPEX_STATUS = {
  queued: "queued",
  running: "running",
  succeeded: "succeeded",
  failed: "failed",
  cancelled: "cancelled",
} as const;

export type ImpexStatus = (typeof IMPEX_STATUS)[keyof typeof IMPEX_STATUS];

export const IMPEX_DIRECTION = {
  import: "import",
  export: "export",
} as const;

export type ImpexDirection = (typeof IMPEX_DIRECTION)[keyof typeof IMPEX_DIRECTION];

export const IMPEX_JOB_TYPE = {
  import: "impex.import",
  export: "impex.export",
} as const;

/** Resources with a wired import/export handler in the worker spike. */
export const IMPEX_SUPPORTED = {
  person: { formats: ["json"] as const },
} as const;

export type ImpexResource = keyof typeof IMPEX_SUPPORTED;
