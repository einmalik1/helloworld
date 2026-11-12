import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { CreateGreetingDto } from "./dto/create-greeting.dto.js";
import { UpdateGreetingDto } from "./dto/update-greeting.dto.js";
import { GreetingService } from "./greeting.service.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  channel_id: z.string().uuid().optional(),
});

@ApiTags("greeting")
@Controller("greeting")
export class GreetingController {
  constructor(private readonly greetings: GreetingService) {}

  @Get()
  list(@Query() query: Record<string, string>) {
    const { page, limit, channel_id } = listQuerySchema.parse(query);
    return this.greetings.list(page, limit, channel_id);
  }

  @Get(":id")
  get(@Param("id", ParseUUIDPipe) id: string) {
    return this.greetings.get(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateGreetingDto) {
    return this.greetings.create(body);
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateGreetingDto) {
    return this.greetings.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.greetings.remove(id);
  }
}
