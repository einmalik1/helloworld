import { Module } from "@nestjs/common";

import { GraphModule } from "../graph/graph.module.js";
import { PersonController } from "./person.controller.js";
import { PersonService } from "./person.service.js";

@Module({
  imports: [GraphModule],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
