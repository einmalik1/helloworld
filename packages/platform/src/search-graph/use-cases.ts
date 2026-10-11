import type { GraphStore, SearchIndex } from "./ports.js";
import type { EntityType, GraphView, SearchResult } from "./types.js";

const ENTITY_TYPES: EntityType[] = ["person", "channel", "greeting", "reaction"];

export function parseEntityType(value: string): EntityType {
  if ((ENTITY_TYPES as string[]).includes(value)) {
    return value as EntityType;
  }
  throw new Error(`invalid entityType: ${value}`);
}

export function parseEntityTypes(csv?: string): EntityType[] | undefined {
  if (!csv?.trim()) return undefined;
  return csv.split(",").map((p) => parseEntityType(p.trim()));
}

export async function getRelated(
  graph: GraphStore,
  entityType: string,
  entityId: string,
): Promise<GraphView> {
  return graph.related({
    entityType: parseEntityType(entityType),
    entityId,
    depth: 1,
  });
}

export async function getSubgraph(
  graph: GraphStore,
  entityType: string,
  entityId: string,
  depth?: number,
): Promise<GraphView> {
  return graph.subgraph({
    entityType: parseEntityType(entityType),
    entityId,
    depth,
  });
}

export async function searchEntities(
  index: SearchIndex,
  q: string,
  typesCsv?: string,
  limit?: number,
): Promise<SearchResult> {
  return index.search({
    q,
    types: parseEntityTypes(typesCsv),
    limit,
  });
}
