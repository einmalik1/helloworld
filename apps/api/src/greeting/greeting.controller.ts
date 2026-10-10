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
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { ListGreetingsPage } from "@helloworld/platform";
import type { GreetingResponse } from "@helloworld/types/api";

import { CreateGreetingDto } from "./dto/create-greeting.dto.js";
import { ListGreetingsQueryDto } from "./dto/list-greetings-query.dto.js";
import { UpdateGreetingDto } from "./dto/update-greeting.dto.js";
import { GreetingService } from "./greeting.service.js";

@ApiTags("greeting")
@Controller("greeting")
export class GreetingController {
  constructor(private readonly greetingService: GreetingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "Greeting created" })
  async create(@Body() body: CreateGreetingDto): Promise<GreetingResponse> {
    const result = await this.greetingService.create(body);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  @Get()
  @ApiOkResponse({ description: "Paginated greeting list" })
  async findAll(@Query() query: ListGreetingsQueryDto): Promise<ListGreetingsPage> {
    const result = await this.greetingService.findAll(query);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  @Get(":id")
  @ApiOkResponse({ description: "Greeting by id" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<GreetingResponse> {
    const result = await this.greetingService.findOne(id);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Greeting updated" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateGreetingDto,
  ): Promise<GreetingResponse> {
    const result = await this.greetingService.update(id, body);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    const result = await this.greetingService.remove(id);
    if (result.isErr()) {
      throw result.error;
    }
  }
}
