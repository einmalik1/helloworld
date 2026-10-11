import { Injectable } from "@nestjs/common";
import { DatabaseService, impexRun, job } from "@helloworld/modules";
import { NotFound } from "@helloworld/types";
import { and, desc, eq } from "drizzle-orm";

import {
  IMPEX_JOB_TYPE,
  IMPEX_STATUS,
  type ImpexDirection,
  type ImpexStatus,
} from "./impex.constants.js";

export type ImpexRunRow = typeof impexRun.$inferSelect;

@Injectable()
export class ImpexRepository {
  constructor(private readonly database: DatabaseService) {}

  async createRunWithJob(input: {
    resource: string;
    direction: ImpexDirection;
    format: string;
    objectKey?: string | null;
  }): Promise<{ run: ImpexRunRow; jobId: string }> {
    const jobType =
      input.direction === "import" ? IMPEX_JOB_TYPE.import : IMPEX_JOB_TYPE.export;

    return this.database.db.transaction(async (tx) => {
      const jobRows = await tx
        .insert(job)
        .values({
          type: jobType,
          status: IMPEX_STATUS.queued,
          payload: {
            resource: input.resource,
            direction: input.direction,
            format: input.format,
            objectKey: input.objectKey ?? null,
          },
        })
        .returning();
      const createdJob = jobRows[0];
      if (!createdJob) {
        throw new Error("Failed to insert impex job");
      }

      const runRows = await tx
        .insert(impexRun)
        .values({
          resource: input.resource,
          direction: input.direction,
          format: input.format,
          status: IMPEX_STATUS.queued,
          objectKey: input.objectKey ?? null,
          jobId: createdJob.id,
        })
        .returning();
      const run = runRows[0];
      if (!run) {
        throw new Error("Failed to insert impex run");
      }

      await tx
        .update(job)
        .set({
          payload: {
            runId: run.id,
            resource: input.resource,
            direction: input.direction,
            format: input.format,
            objectKey: input.objectKey ?? null,
          },
          updatedAt: new Date(),
        })
        .where(eq(job.id, createdJob.id));

      return { run, jobId: createdJob.id };
    });
  }

  async getRun(id: string): Promise<ImpexRunRow> {
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

  async listRuns(filters?: {
    resource?: string;
    direction?: string;
    limit?: number;
  }): Promise<ImpexRunRow[]> {
    const limit = filters?.limit ?? 50;
    const conditions = [];
    if (filters?.resource) {
      conditions.push(eq(impexRun.resource, filters.resource));
    }
    if (filters?.direction) {
      conditions.push(eq(impexRun.direction, filters.direction));
    }
    const query = this.database.db.select().from(impexRun).orderBy(desc(impexRun.createdAt)).limit(limit);
    if (conditions.length === 0) {
      return query;
    }
    return this.database.db
      .select()
      .from(impexRun)
      .where(and(...conditions))
      .orderBy(desc(impexRun.createdAt))
      .limit(limit);
  }

  async updateRunStatus(
    id: string,
    status: ImpexStatus,
    patch?: Partial<{
      objectKey: string | null;
      errorSummary: string | null;
      rowsTotal: number | null;
      rowsError: number | null;
    }>,
  ): Promise<ImpexRunRow> {
    const now = new Date();
    const terminal =
      status === IMPEX_STATUS.succeeded ||
      status === IMPEX_STATUS.failed ||
      status === IMPEX_STATUS.cancelled;
    const rows = await this.database.db
      .update(impexRun)
      .set({
        status,
        updatedAt: now,
        finishedAt: terminal ? now : null,
        ...(patch?.objectKey !== undefined ? { objectKey: patch.objectKey } : {}),
        ...(patch?.errorSummary !== undefined ? { errorSummary: patch.errorSummary } : {}),
        ...(patch?.rowsTotal !== undefined ? { rowsTotal: patch.rowsTotal } : {}),
        ...(patch?.rowsError !== undefined ? { rowsError: patch.rowsError } : {}),
      })
      .where(eq(impexRun.id, id))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new NotFound(`Impex run ${id} not found`);
    }
    return row;
  }
}
