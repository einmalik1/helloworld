import { Module } from "@nestjs/common";

import { ChannelController } from "./channel.controller.js";
import { ChannelService } from "./channel.service.js";

@Module({
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
