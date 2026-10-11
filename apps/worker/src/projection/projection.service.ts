import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, Interval } from "@nestjs/schedule";
import type { ProjectionSync } from "@helloworld/platform";

import { PROJECTION_SYNC } from "./projection.tokens.js";

@Injectable()
export class ProjectionService {
  private readonly logger = new Logger(ProjectionService.name);

  constructor(@Inject(PROJECTION_SYNC) private readonly projection: ProjectionSync) {}

  @Interval(15_000)
  async drainOutbox(): Promise<void> {
    try {
      const processed = await this.projection.drainPending(50);
      if (processed > 0) {
        this.logger.log(`Drained ${processed} search_sync_outbox row(s)`);
      }
    } catch (error) {
      this.logger.warn(
        `Outbox drain failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /** Nightly-ish rebuild; also useful after empty indexes. */
  @Cron("0 3 * * *")
  async rebuildIndexes(): Promise<void> {
    try {
      const result = await this.projection.rebuild();
      this.logger.log(
        `Rebuild complete: ${result.nodes} graph nodes, ${result.documents} search docs`,
      );
    } catch (error) {
      this.logger.warn(`Rebuild failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /** Manual/admin hook for tests and operators. */
  async rebuildNow(): Promise<{ nodes: number; documents: number }> {
    return this.projection.rebuild();
  }
}
