import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { getRelated, getSubgraph, type GraphStore } from "@helloworld/platform";
import { z } from "zod";

import { GRAPH_STORE } from "../search-graph/search-graph.tokens.js";

const relatedQuerySchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().uuid(),
});

const subgraphQuerySchema = relatedQuerySchema.extend({
  depth: z.coerce.number().int().min(1).max(3).optional(),
});

@ApiTags("graph")
@Controller("graph")
export class GraphController {
  constructor(@Inject(GRAPH_STORE) private readonly graph: GraphStore) {}

  @Get("related")
  async related(@Query() query: Record<string, string>) {
    const parsed = relatedQuerySchema.parse(query);
    return getRelated(this.graph, parsed.entityType, parsed.entityId);
  }

  @Get("subgraph")
  async subgraph(@Query() query: Record<string, string>) {
    const parsed = subgraphQuerySchema.parse(query);
    return getSubgraph(this.graph, parsed.entityType, parsed.entityId, parsed.depth);
  }
}
