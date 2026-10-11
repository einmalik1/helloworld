import type { EntityType, GraphView, OutboxRow, SearchResult } from "./types.js";

export type GraphQuery = {
  entityType: EntityType;
  entityId: string;
  depth?: number;
};

export type SearchQuery = {
  q: string;
  types?: EntityType[];
  limit?: number;
};

export interface GraphStore {
  related(query: GraphQuery): Promise<GraphView>;
  subgraph(query: GraphQuery): Promise<GraphView>;
}

export interface SearchIndex {
  search(query: SearchQuery): Promise<SearchResult>;
  ensureCollection(): Promise<void>;
  upsertDocument(doc: {
    id: string;
    type: EntityType;
    title: string;
    body?: string;
    refId: string;
    updatedAt: string;
  }): Promise<void>;
  deleteDocument(id: string): Promise<void>;
}

export interface ProjectionSync {
  applyOutboxRow(row: OutboxRow): Promise<void>;
  rebuild(): Promise<{ nodes: number; documents: number }>;
  drainPending(limit?: number): Promise<number>;
}

export interface SearchSyncOutbox {
  enqueue(input: {
    aggregateType: EntityType;
    aggregateId: string;
    op: "upsert" | "delete";
    payload?: Record<string, unknown> | null;
  }): Promise<string>;
  listPending(limit: number): Promise<OutboxRow[]>;
  markProcessed(id: string): Promise<void>;
}
