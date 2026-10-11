import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Interval } from "@nestjs/schedule";
import { DatabaseService, ObjectStorageService } from "@helloworld/modules";

import type { AppConfig } from "../configuration.js";
import { exportPersonJson, importPersonJson } from "./impex-person.js";
import { JOB_TYPE } from "./job.constants.js";
import { JobsRepository } from "./jobs.repository.js";

@Injectable()
export class ImpexJob {
  private readonly logger = new Logger(ImpexJob.name);
  private running = false;

  constructor(
    private readonly jobs: JobsRepository,
    private readonly storage: ObjectStorageService,
    private readonly database: DatabaseService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Interval(5_000)
  async processQueued(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      const concurrency = this.config.get("WORKER_CONCURRENCY", { infer: true });
      const claimed = await this.jobs.claimQueuedImpexJobs(concurrency);
      for (const jobRow of claimed) {
        await this.execute(jobRow.id, jobRow.type, jobRow.payload);
      }
    } finally {
      this.running = false;
    }
  }

  private async execute(
    jobId: string,
    type: string,
    payload: Record<string, unknown> | null,
  ): Promise<void> {
    const runId = typeof payload?.runId === "string" ? payload.runId : null;
    const resource = typeof payload?.resource === "string" ? payload.resource : null;
    const format = typeof payload?.format === "string" ? payload.format : null;
    const objectKey = typeof payload?.objectKey === "string" ? payload.objectKey : null;

    if (!runId || !resource || !format) {
      await this.jobs.markFailed(jobId, "Invalid impex job payload");
      if (runId) {
        await this.jobs.markImpexRunTerminal(runId, "failed", {
          errorSummary: "Invalid impex job payload",
        });
      }
      return;
    }

    await this.jobs.markImpexRunRunning(runId);

    try {
      if (resource !== "person" || format !== "json") {
        throw new Error(`Unsupported impex target ${resource}/${format}`);
      }

      let result;
      if (type === JOB_TYPE.impexImport) {
        if (!objectKey) {
          throw new Error("Import job missing objectKey");
        }
        result = await importPersonJson(this.storage, this.database, objectKey);
      } else if (type === JOB_TYPE.impexExport) {
        result = await exportPersonJson(this.storage, this.database, runId);
      } else {
        throw new Error(`Unexpected job type ${type}`);
      }

      const failed = (result.rowsError ?? 0) > 0;
      if (failed) {
        await this.jobs.markFailed(jobId, result.errorSummary ?? "row errors");
        await this.jobs.markImpexRunTerminal(runId, "failed", {
          objectKey: result.objectKey,
          errorSummary: result.errorSummary,
          rowsTotal: result.rowsTotal,
          rowsError: result.rowsError,
        });
      } else {
        await this.jobs.markSucceeded(jobId);
        await this.jobs.markImpexRunTerminal(runId, "succeeded", {
          objectKey: result.objectKey,
          errorSummary: null,
          rowsTotal: result.rowsTotal,
          rowsError: 0,
        });
      }
      this.logger.log(`Impex job ${jobId} finished status=${failed ? "failed" : "succeeded"}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "impex job failed";
      await this.jobs.markFailed(jobId, message);
      await this.jobs.markImpexRunTerminal(runId, "failed", { errorSummary: message });
      this.logger.error(`Impex job ${jobId} failed: ${message}`);
    }
  }
}
