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
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

import {
  CreateGreetingReactionDto,
  GreetingReactionResponseDto,
  UpdateGreetingReactionDto,
} from "./dto/index.js";
import { ListGreetingReactionQueryDto } from "./dto/list-greeting-reaction-query.dto.js";
import { GreetingReactionService } from "./greeting-reaction.service.js";

@ApiTags("greeting-reaction")
@Controller("greeting-reaction")
export class GreetingReactionController {
  constructor(private readonly greetingReactionService: GreetingReactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: GreetingReactionResponseDto })
  create(@Body() body: CreateGreetingReactionDto) {
    return this.greetingReactionService.create(body);
  }

  @Get()
  @ApiOkResponse({ description: "Paginated greeting reaction list" })
  list(@Query() query: ListGreetingReactionQueryDto) {
    return this.greetingReactionService.list(query.page, query.limit);
  }

  @Get(":id")
  @ApiOkResponse({ type: GreetingReactionResponseDto })
  getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.greetingReactionService.getById(id);
  }

  @Patch(":id")
  @ApiOkResponse({ type: GreetingReactionResponseDto })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateGreetingReactionDto,
  ) {
    return this.greetingReactionService.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.greetingReactionService.remove(id);
  }
}
