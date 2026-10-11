import { Module } from "@nestjs/common";

import { GraphModule } from "../graph/graph.module.js";
import { SearchController } from "./search.controller.js";

@Module({
  imports: [GraphModule],
  controllers: [SearchController],
})
export class SearchModule {}
