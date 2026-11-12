import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Interval } from "@nestjs/schedule";

import type { AppConfig } from "../configuration.js";
import { JobsRepository } from "./jobs.repository.js";

/**
 * Observes generic `outbox` rows without claiming them.
 * Projection uses `search_sync_outbox` (ProjectionService); marking generic rows
 * processed without AGE/Typesense handlers was a silent drop (MLK-602).
 */
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

      this.logger.warn(
        `Leaving ${pending.length} generic outbox row(s) unprocessed — no handlers registered; domain sync uses search_sync_outbox`,
      );
    } finally {
      this.running = false;
    }
  }
}
