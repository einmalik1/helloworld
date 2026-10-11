export type EntityType = "person" | "channel" | "greeting" | "reaction";

export type GraphNode = {
  id: string;
  type: EntityType;
  label: string;
  data?: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  type: string;
  source: string;
  target: string;
};

export type GraphView = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type SearchHit = {
  id: string;
  type: EntityType;
  title: string;
  body?: string;
  score?: number;
};

export type SearchResult = {
  items: SearchHit[];
  total: number;
};

export type OutboxOp = "upsert" | "delete";

export type OutboxRow = {
  id: string;
  aggregateType: EntityType;
  aggregateId: string;
  op: OutboxOp;
  payload?: Record<string, unknown> | null;
};
