import { Module } from "@nestjs/common";

import { GreetingReactionController } from "./greeting-reaction.controller.js";
import { GreetingReactionService } from "./greeting-reaction.service.js";

@Module({
  controllers: [GreetingReactionController],
  providers: [GreetingReactionService],
  exports: [GreetingReactionService],
})
export class GreetingReactionModule {}
