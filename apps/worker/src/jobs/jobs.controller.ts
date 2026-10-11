import { Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";

import { JobsRepository } from "./jobs.repository.js";

@Controller("jobs")
export class JobsController {
  constructor(private readonly jobs: JobsRepository) {}

  @Get()
  async list() {
    const rows = await this.jobs.listJobs();
    return { items: rows.map(serializeJob) };
  }

  @Get(":id")
  async get(@Param("id", ParseUUIDPipe) id: string) {
    return serializeJob(await this.jobs.getJob(id));
  }

  @Post(":id/retry")
  async retry(@Param("id", ParseUUIDPipe) id: string) {
    return serializeJob(await this.jobs.retryJob(id));
  }
}

function serializeJob(row: {
  id: string;
  type: string;
  status: string;
  payload: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
}) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    payload: row.payload,
    error: row.error,
    attempts: row.attempts,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    startedAt: row.startedAt?.toISOString() ?? null,
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
}
