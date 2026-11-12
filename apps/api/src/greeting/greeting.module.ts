import { Module } from "@nestjs/common";

import { GraphModule } from "../graph/graph.module.js";
import { GreetingController } from "./greeting.controller.js";
import { GreetingService } from "./greeting.service.js";

@Module({
  imports: [GraphModule],
  controllers: [GreetingController],
  providers: [GreetingService],
  exports: [GreetingService],
})
export class GreetingModule {}
