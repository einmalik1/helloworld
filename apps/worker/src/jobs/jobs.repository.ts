import { Injectable } from "@nestjs/common";
import { DatabaseService, impexRun, job, outbox } from "@helloworld/modules";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { NotFound } from "@helloworld/types";

import { isImpexJobType, JOB_STATUS, JOB_TYPE, type JobStatus } from "./job.constants.js";

export type JobRow = typeof job.$inferSelect;
export type OutboxRow = typeof outbox.$inferSelect;
export type ImpexRunRow = typeof impexRun.$inferSelect;

@Injectable()
export class JobsRepository {
  constructor(private readonly database: DatabaseService) {}

  async listJobs(limit = 50): Promise<JobRow[]> {
    return this.database.db
      .select()
      .from(job)
      .orderBy(desc(job.createdAt))
      .limit(limit);
  }

  async getJob(id: string): Promise<JobRow> {
    const rows = await this.database.db.select().from(job).where(eq(job.id, id)).limit(1);
    const row = rows[0];
    if (!row) {
      throw new NotFound(`Job ${id} not found`);
    }
    return row;
  }

  async createJob(input: {
    type: string;
    status?: JobStatus;
    payload?: Record<string, unknown> | null;
  }): Promise<JobRow> {
    const rows = await this.database.db
      .insert(job)
      .values({
        type: input.type,
        status: input.status ?? JOB_STATUS.queued,
        payload: input.payload ?? null,
      })
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error("Failed to insert job");
    }
    return row;
  }

  async markRunning(id: string): Promise<JobRow> {
    const now = new Date();
    const rows = await this.database.db
      .update(job)
      .set({
        status: JOB_STATUS.running,
        startedAt: now,
        updatedAt: now,
        attempts: sql`${job.attempts} + 1`,
      })
      .where(eq(job.id, id))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new NotFound(`Job ${id} not found`);
    }
    return row;
  }

  async markSucceeded(id: string): Promise<JobRow> {
    const now = new Date();
    const rows = await this.database.db
      .update(job)
      .set({
        status: JOB_STATUS.succeeded,
        finishedAt: now,
        updatedAt: now,
        error: null,
      })
      .where(eq(job.id, id))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new NotFound(`Job ${id} not found`);
    }
    return row;
  }

  async markFailed(id: string, error: string): Promise<JobRow> {
    const now = new Date();
    const rows = await this.database.db
      .update(job)
      .set({
        status: JOB_STATUS.failed,
        finishedAt: now,
        updatedAt: now,
        error,
      })
      .where(eq(job.id, id))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new NotFound(`Job ${id} not found`);
    }
    return row;
  }

  async retryJob(id: string): Promise<JobRow> {
    const existing = await this.getJob(id);
    if (existing.status !== JOB_STATUS.failed) {
      return existing;
    }
    const now = new Date();
    const rows = await this.database.db
      .update(job)
      .set({
        status: JOB_STATUS.queued,
        updatedAt: now,
        startedAt: null,
        finishedAt: null,
        error: null,
      })
      .where(and(eq(job.id, id), eq(job.status, JOB_STATUS.failed)))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new NotFound(`Job ${id} not found`);
    }
    if (isImpexJobType(row.type)) {
      const runId = typeof row.payload?.runId === "string" ? row.payload.runId : null;
      if (runId) {
        await this.database.db
          .update(impexRun)
          .set({
            status: JOB_STATUS.queued,
            updatedAt: now,
            finishedAt: null,
            errorSummary: null,
          })
          .where(eq(impexRun.id, runId));
      }
    }
    return row;
  }

  async claimQueuedImpexJobs(limit: number): Promise<JobRow[]> {
    const candidates = await this.database.db
      .select()
      .from(job)
      .where(
        and(
          eq(job.status, JOB_STATUS.queued),
          inArray(job.type, [JOB_TYPE.impexImport, JOB_TYPE.impexExport]),
        ),
      )
      .orderBy(job.createdAt)
      .limit(limit);

    const claimed: JobRow[] = [];
    for (const candidate of candidates) {
      const now = new Date();
      const rows = await this.database.db
        .update(job)
        .set({
          status: JOB_STATUS.running,
          startedAt: now,
          updatedAt: now,
          attempts: sql`${job.attempts} + 1`,
        })
        .where(and(eq(job.id, candidate.id), eq(job.status, JOB_STATUS.queued)))
        .returning();
      const row = rows[0];
      if (row) {
        claimed.push(row);
      }
    }
    return claimed;
  }

  async getImpexRun(id: string): Promise<ImpexRunRow> {
    const rows = await this.database.db
      .select()
      .from(impexRun)
      .where(eq(impexRun.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) {
      throw new NotFound(`Impex run ${id} not found`);
    }
    return row;
  }

  async markImpexRunRunning(id: string): Promise<void> {
    const now = new Date();
    await this.database.db
      .update(impexRun)
      .set({ status: JOB_STATUS.running, updatedAt: now, finishedAt: null })
      .where(eq(impexRun.id, id));
  }

  async markImpexRunTerminal(
    id: string,
    status: "succeeded" | "failed",
    patch?: {
      objectKey?: string | null;
      errorSummary?: string | null;
      rowsTotal?: number | null;
      rowsError?: number | null;
    },
  ): Promise<void> {
    const now = new Date();
    await this.database.db
      .update(impexRun)
      .set({
        status,
        updatedAt: now,
        finishedAt: now,
        ...(patch?.objectKey !== undefined ? { objectKey: patch.objectKey } : {}),
        ...(patch?.errorSummary !== undefined ? { errorSummary: patch.errorSummary } : {}),
        ...(patch?.rowsTotal !== undefined ? { rowsTotal: patch.rowsTotal } : {}),
        ...(patch?.rowsError !== undefined ? { rowsError: patch.rowsError } : {}),
      })
      .where(eq(impexRun.id, id));
  }

  async claimPendingOutbox(limit: number): Promise<OutboxRow[]> {
    return this.database.db
      .select()
      .from(outbox)
      .where(isNull(outbox.processedAt))
      .orderBy(outbox.createdAt)
      .limit(limit);
  }

  async markOutboxProcessed(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const now = new Date();
    for (const id of ids) {
      await this.database.db
        .update(outbox)
        .set({ processedAt: now })
        .where(eq(outbox.id, id));
    }
  }
}
