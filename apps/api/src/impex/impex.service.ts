import { Injectable } from "@nestjs/common";
import { ObjectStorageService } from "@helloworld/modules";
import { StorageError, ValidationError } from "@helloworld/types";
import { randomUUID } from "node:crypto";

import {
  IMPEX_DIRECTION,
  IMPEX_SUPPORTED,
  type ImpexResource,
} from "./impex.constants.js";
import { ImpexRepository, type ImpexRunRow } from "./impex.repository.js";

function assertSupported(resource: string, format: string): asserts resource is ImpexResource {
  const entry = IMPEX_SUPPORTED[resource as ImpexResource];
  if (!entry) {
    throw new ValidationError(`Unsupported impex resource: ${resource}`);
  }
  if (!(entry.formats as readonly string[]).includes(format)) {
    throw new ValidationError(
      `Unsupported format "${format}" for resource "${resource}" (supported: ${entry.formats.join(", ")})`,
    );
  }
}

function serializeRun(row: ImpexRunRow) {
  return {
    id: row.id,
    resource: row.resource,
    direction: row.direction,
    format: row.format,
    status: row.status,
    objectKey: row.objectKey,
    errorSummary: row.errorSummary,
    jobId: row.jobId,
    rowsTotal: row.rowsTotal,
    rowsError: row.rowsError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
}

@Injectable()
export class ImpexService {
  constructor(
    private readonly runs: ImpexRepository,
    private readonly storage: ObjectStorageService,
  ) {}

  async createUpload(input: {
    content: string;
    contentType?: string;
  }): Promise<{ objectKey: string }> {
    const objectKey = `impex/uploads/${randomUUID()}.json`;
    const result = await this.storage.putObject({
      key: objectKey,
      body: Buffer.from(input.content, "utf8"),
      contentType: input.contentType ?? "application/json",
    });
    if (result.isErr()) {
      throw new StorageError(result.error.message, result.error);
    }
    return { objectKey };
  }

  async startImport(resource: string, body: { objectKey: string; format: string }) {
    assertSupported(resource, body.format);
    if (!body.objectKey?.trim()) {
      throw new ValidationError("objectKey is required");
    }
    const { run, jobId } = await this.runs.createRunWithJob({
      resource,
      direction: IMPEX_DIRECTION.import,
      format: body.format,
      objectKey: body.objectKey,
    });
    return { runId: run.id, jobId, run: serializeRun(run) };
  }

  async startExport(resource: string, body: { format: string }) {
    assertSupported(resource, body.format);
    const { run, jobId } = await this.runs.createRunWithJob({
      resource,
      direction: IMPEX_DIRECTION.export,
      format: body.format,
      objectKey: null,
    });
    return { runId: run.id, jobId, run: serializeRun(run) };
  }

  async getRun(runId: string) {
    return serializeRun(await this.runs.getRun(runId));
  }

  async listRuns(filters?: { resource?: string; direction?: string }) {
    const items = await this.runs.listRuns(filters);
    return { items: items.map(serializeRun) };
  }

  async downloadExport(runId: string): Promise<{
    body: Buffer;
    contentType: string;
    objectKey: string;
  }> {
    const run = await this.runs.getRun(runId);
    if (run.direction !== IMPEX_DIRECTION.export) {
      throw new ValidationError("Download is only available for export runs");
    }
    if (run.status !== "succeeded" || !run.objectKey) {
      throw new ValidationError("Export artifact is not ready");
    }
    const result = await this.storage.getObject(run.objectKey);
    if (result.isErr()) {
      throw new StorageError(result.error.message, result.error);
    }
    return {
      body: result.value.body,
      contentType: result.value.contentType ?? "application/json",
      objectKey: run.objectKey,
    };
  }
}
