import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Interval } from "@nestjs/schedule";

import type { AppConfig } from "../configuration.js";
import { JOB_TYPE } from "./job.constants.js";
import { JobsRepository } from "./jobs.repository.js";

/** Interval drain of transactional outbox rows (AGE/Typesense handlers land later). */
@Injectable()
export class OutboxDrainJob {
  private readonly logger = new Logger(OutboxDrainJob.name);
  private running = false;

  constructor(
    private readonly jobs: JobsRepository,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Interval(5_000)
  async drain(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      const concurrency = this.config.get("WORKER_CONCURRENCY", { infer: true });
      const pending = await this.jobs.claimPendingOutbox(concurrency);
      if (pending.length === 0) {
        return;
      }

      const run = await this.jobs.createJob({
        type: JOB_TYPE.outboxDrain,
        payload: { count: pending.length },
      });
      await this.jobs.markRunning(run.id);

      try {
        // Projection engines (AGE / Typesense) are wired in a later change.
        await this.jobs.markOutboxProcessed(pending.map((row) => row.id));
        await this.jobs.markSucceeded(run.id);
        this.logger.log(`Drained ${pending.length} outbox row(s)`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "outbox drain failed";
        await this.jobs.markFailed(run.id, message);
        throw err;
      }
    } finally {
      this.running = false;
    }
  }
}
