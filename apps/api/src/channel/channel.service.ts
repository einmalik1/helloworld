import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@helloworld/modules";
import {
  createChannel,
  deleteChannel,
  getChannel,
  listChannels,
  updateChannel,
  type ChannelError,
  type ChannelListResult,
  type ChannelRecord,
  type CreateChannel,
  type UpdateChannel,
} from "@helloworld/platform";
import type { Result } from "neverthrow";

import { createChannelRepository } from "./channel.repository.js";

@Injectable()
export class ChannelService {
  private readonly repo;

  constructor(database: DatabaseService) {
    this.repo = createChannelRepository(database);
  }

  create(input: CreateChannel): Promise<Result<ChannelRecord, ChannelError>> {
    return createChannel(this.repo, input);
  }

  findOne(id: string): Promise<Result<ChannelRecord, ChannelError>> {
    return getChannel(this.repo, id);
  }

  findAll(
    page: number,
    limit: number,
  ): Promise<Result<ChannelListResult, ChannelError>> {
    return listChannels(this.repo, { page, limit });
  }

  update(
    id: string,
    input: UpdateChannel,
  ): Promise<Result<ChannelRecord, ChannelError>> {
    return updateChannel(this.repo, id, input);
  }

  remove(id: string): Promise<Result<void, ChannelError>> {
    return deleteChannel(this.repo, id);
  }
}
