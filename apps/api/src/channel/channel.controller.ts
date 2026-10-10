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

import { ChannelService } from "./channel.service.js";
import {
  ChannelResponseDto,
  CreateChannelDto,
  UpdateChannelDto,
} from "./dto/index.js";
import { ListChannelsQueryDto } from "./list-channels-query.dto.js";

@ApiTags("channel")
@Controller("channel")
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateChannelDto): Promise<ChannelResponseDto> {
    const result = await this.channelService.create(body);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  @Get()
  async findAll(@Query() query: ListChannelsQueryDto) {
    const result = await this.channelService.findAll(query.page, query.limit);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ChannelResponseDto> {
    const result = await this.channelService.findOne(id);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateChannelDto,
  ): Promise<ChannelResponseDto> {
    const result = await this.channelService.update(id, body);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    const result = await this.channelService.remove(id);
    if (result.isErr()) {
      throw result.error;
    }
  }
}
