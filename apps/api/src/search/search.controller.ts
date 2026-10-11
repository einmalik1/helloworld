import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { searchEntities, type SearchIndex } from "@helloworld/platform";
import { z } from "zod";

import { SEARCH_INDEX } from "../search-graph/search-graph.tokens.js";

const searchQuerySchema = z.object({
  q: z.string().default(""),
  types: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(@Inject(SEARCH_INDEX) private readonly index: SearchIndex) {}

  @Get()
  async search(@Query() query: Record<string, string>) {
    const parsed = searchQuerySchema.parse(query);
    return searchEntities(this.index, parsed.q, parsed.types, parsed.limit);
  }
}
