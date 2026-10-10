import type { SearchSyncOutbox } from "./ports.js";
import type { EntityType, OutboxRow } from "./types.js";
import type { SqlExecutor } from "./relational-graph-store.js";

export class PostgresSearchSyncOutbox implements SearchSyncOutbox {
  constructor(private readonly sql: SqlExecutor) {}

  async enqueue(input: {
    aggregateType: EntityType;
    aggregateId: string;
    op: "upsert" | "delete";
    payload?: Record<string, unknown> | null;
  }): Promise<string> {
    const rows = await this.sql<{ id: string }>`
      insert into search_sync_outbox (aggregate_type, aggregate_id, op, payload)
      values (
        ${input.aggregateType},
        ${input.aggregateId}::uuid,
        ${input.op},
        ${input.payload ? JSON.stringify(input.payload) : null}::jsonb
      )
      returning id::text`;
    const id = rows[0]?.id;
    if (!id) throw new Error("failed to enqueue search_sync_outbox row");
    return id;
  }

  async listPending(limit: number): Promise<OutboxRow[]> {
    const rows = await this.sql<{
      id: string;
      aggregate_type: EntityType;
      aggregate_id: string;
      op: "upsert" | "delete";
      payload: Record<string, unknown> | null;
    }>`
      select id::text, aggregate_type, aggregate_id::text, op, payload
      from search_sync_outbox
      where processed_at is null
      order by created_at asc
      limit ${limit}`;
    return rows.map((r) => ({
      id: r.id,
      aggregateType: r.aggregate_type,
      aggregateId: r.aggregate_id,
      op: r.op,
      payload: r.payload,
    }));
  }

  async markProcessed(id: string): Promise<void> {
    await this.sql`
      update search_sync_outbox
      set processed_at = now()
      where id = ${id}::uuid`;
  }
}
