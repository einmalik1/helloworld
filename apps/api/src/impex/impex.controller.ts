import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ValidationError } from "@helloworld/types";
import type { Response } from "express";
import { z } from "zod";

import { ImpexService } from "./impex.service.js";

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.issues);
  }
  return result.data;
}

const uploadBodySchema = z.object({
  content: z.string().min(1),
  contentType: z.string().optional(),
});

const importBodySchema = z.object({
  objectKey: z.string().min(1),
  format: z.string().min(1),
});

const exportBodySchema = z.object({
  format: z.string().min(1),
});

const listQuerySchema = z.object({
  resource: z.string().optional(),
  direction: z.string().optional(),
});

@ApiTags("impex")
@Controller("impex")
export class ImpexController {
  constructor(private readonly impex: ImpexService) {}

  @Post("uploads")
  async upload(@Body() body: unknown) {
    const parsed = parseBody(uploadBodySchema, body);
    return this.impex.createUpload(parsed);
  }

  @Post(":resource/imports")
  @HttpCode(HttpStatus.ACCEPTED)
  async startImport(@Param("resource") resource: string, @Body() body: unknown) {
    const parsed = parseBody(importBodySchema, body);
    return this.impex.startImport(resource, parsed);
  }

  @Post(":resource/exports")
  @HttpCode(HttpStatus.ACCEPTED)
  async startExport(@Param("resource") resource: string, @Body() body: unknown) {
    const parsed = parseBody(exportBodySchema, body);
    return this.impex.startExport(resource, parsed);
  }

  @Get("runs")
  async listRuns(@Query() query: Record<string, string>) {
    const parsed = parseBody(listQuerySchema, query);
    return this.impex.listRuns(parsed);
  }

  @Get("runs/:runId")
  async getRun(@Param("runId", ParseUUIDPipe) runId: string) {
    return this.impex.getRun(runId);
  }

  @Get("runs/:runId/download")
  async download(
    @Param("runId", ParseUUIDPipe) runId: string,
    @Res() res: Response,
  ): Promise<void> {
    const artifact = await this.impex.downloadExport(runId);
    res.setHeader("Content-Type", artifact.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${artifact.objectKey.split("/").pop()}"`);
    res.send(artifact.body);
  }
}
