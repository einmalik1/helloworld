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

import { CreatePersonDto } from "./dto/create-person.dto.js";
import { UpdatePersonDto } from "./dto/update-person.dto.js";
import { PersonService } from "./person.service.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

@ApiTags("person")
@Controller("person")
export class PersonController {
  constructor(private readonly persons: PersonService) {}

  @Get()
  list(@Query() query: Record<string, string>) {
    const { page, limit } = listQuerySchema.parse(query);
    return this.persons.list(page, limit);
  }

  @Get(":id")
  get(@Param("id", ParseUUIDPipe) id: string) {
    return this.persons.get(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreatePersonDto) {
    return this.persons.create(body);
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdatePersonDto) {
    return this.persons.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.persons.remove(id);
  }
}
