import { Module } from "@nestjs/common";

import { searchGraphProviders } from "../search-graph/search-graph.providers.js";
import { GraphController } from "./graph.controller.js";

@Module({
  controllers: [GraphController],
  providers: searchGraphProviders,
  exports: searchGraphProviders,
})
export class GraphModule {}
