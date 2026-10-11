import type { GraphStore, GraphQuery } from "./ports.js";
import type { EntityType, GraphEdge, GraphNode, GraphView } from "./types.js";

/** Minimal SQL executor (postgres.js tagged template or compatible). */
export type SqlExecutor = {
  <T extends Record<string, unknown> = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
};

function nodeId(type: EntityType, id: string): string {
  return `${type}:${id}`;
}

/**
 * Graph retrieve from Postgres SoT via SQL joins.
 * AGE remains the projection target for worker sync; reads stay correct even when
 * the secondary AGE graph lags (ADR 0006 secondary-index model).
 */
export class RelationalGraphStore implements GraphStore {
  constructor(private readonly sql: SqlExecutor) {}

  async related(query: GraphQuery): Promise<GraphView> {
    return this.subgraph({ ...query, depth: 1 });
  }

  async subgraph(query: GraphQuery): Promise<GraphView> {
    const depth = Math.min(Math.max(query.depth ?? 1, 1), 3);
    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, GraphEdge>();

    const seed = await this.loadEntity(query.entityType, query.entityId);
    if (!seed) {
      return { nodes: [], edges: [] };
    }
    nodes.set(seed.id, seed);

    let frontier: GraphNode[] = [seed];
    for (let d = 0; d < depth; d++) {
      const next: GraphNode[] = [];
      for (const node of frontier) {
        const neighbors = await this.neighborsOf(node);
        for (const { node: n, edge } of neighbors) {
          if (!nodes.has(n.id)) {
            nodes.set(n.id, n);
            next.push(n);
          }
          edges.set(edge.id, edge);
        }
      }
      frontier = next;
    }

    return {
      nodes: [...nodes.values()],
      edges: [...edges.values()],
    };
  }

  private async loadEntity(type: EntityType, id: string): Promise<GraphNode | null> {
    switch (type) {
      case "person": {
        const rows = await this.sql<{ id: string; display_name: string }>`
          select id::text, display_name from person where id = ${id}::uuid limit 1`;
        const row = rows[0];
        return row
          ? { id: nodeId("person", row.id), type: "person", label: row.display_name }
          : null;
      }
      case "channel": {
        const rows = await this.sql<{ id: string; name: string }>`
          select id::text, name from channel where id = ${id}::uuid limit 1`;
        const row = rows[0];
        return row ? { id: nodeId("channel", row.id), type: "channel", label: row.name } : null;
      }
      case "greeting": {
        const rows = await this.sql<{ id: string; message: string }>`
          select id::text, message from greeting where id = ${id}::uuid limit 1`;
        const row = rows[0];
        return row
          ? {
              id: nodeId("greeting", row.id),
              type: "greeting",
              label: row.message.slice(0, 80),
            }
          : null;
      }
      case "reaction": {
        const rows = await this.sql<{ id: string; emoji: string }>`
          select id::text, emoji from greeting_reaction where id = ${id}::uuid limit 1`;
        const row = rows[0];
        return row ? { id: nodeId("reaction", row.id), type: "reaction", label: row.emoji } : null;
      }
      default:
        return null;
    }
  }

  private async neighborsOf(node: GraphNode): Promise<Array<{ node: GraphNode; edge: GraphEdge }>> {
    const refId = node.id.split(":")[1]!;
    const out: Array<{ node: GraphNode; edge: GraphEdge }> = [];

    if (node.type === "person") {
      const greetings = await this.sql<{ id: string; message: string }>`
        select id::text, message from greeting where author_id = ${refId}::uuid`;
      for (const g of greetings) {
        const n: GraphNode = {
          id: nodeId("greeting", g.id),
          type: "greeting",
          label: g.message.slice(0, 80),
        };
        out.push({
          node: n,
          edge: {
            id: `authored:${refId}:${g.id}`,
            type: "authored",
            source: node.id,
            target: n.id,
          },
        });
      }
      const reactions = await this.sql<{ id: string; emoji: string; greeting_id: string }>`
        select id::text, emoji, greeting_id::text from greeting_reaction where person_id = ${refId}::uuid`;
      for (const r of reactions) {
        const n: GraphNode = {
          id: nodeId("reaction", r.id),
          type: "reaction",
          label: r.emoji,
        };
        out.push({
          node: n,
          edge: {
            id: `reacted_to:${refId}:${r.greeting_id}`,
            type: "reacted_to",
            source: node.id,
            target: nodeId("greeting", r.greeting_id),
          },
        });
      }
    }

    if (node.type === "greeting") {
      const authors = await this.sql<{ id: string; display_name: string }>`
        select p.id::text, p.display_name
        from person p
        join greeting g on g.author_id = p.id
        where g.id = ${refId}::uuid`;
      for (const p of authors) {
        const n: GraphNode = {
          id: nodeId("person", p.id),
          type: "person",
          label: p.display_name,
        };
        out.push({
          node: n,
          edge: {
            id: `authored:${p.id}:${refId}`,
            type: "authored",
            source: n.id,
            target: node.id,
          },
        });
      }
      const channels = await this.sql<{ id: string; name: string }>`
        select c.id::text, c.name
        from channel c
        join greeting g on g.channel_id = c.id
        where g.id = ${refId}::uuid`;
      for (const c of channels) {
        const n: GraphNode = {
          id: nodeId("channel", c.id),
          type: "channel",
          label: c.name,
        };
        out.push({
          node: n,
          edge: {
            id: `posted_in:${refId}:${c.id}`,
            type: "posted_in",
            source: node.id,
            target: n.id,
          },
        });
      }
      const reactions = await this.sql<{ id: string; emoji: string }>`
        select id::text, emoji from greeting_reaction where greeting_id = ${refId}::uuid`;
      for (const r of reactions) {
        const n: GraphNode = {
          id: nodeId("reaction", r.id),
          type: "reaction",
          label: r.emoji,
        };
        out.push({
          node: n,
          edge: {
            id: `reaction_on:${r.id}:${refId}`,
            type: "reaction_on",
            source: n.id,
            target: node.id,
          },
        });
      }
    }

    if (node.type === "channel") {
      const greetings = await this.sql<{ id: string; message: string }>`
        select id::text, message from greeting where channel_id = ${refId}::uuid`;
      for (const g of greetings) {
        const n: GraphNode = {
          id: nodeId("greeting", g.id),
          type: "greeting",
          label: g.message.slice(0, 80),
        };
        out.push({
          node: n,
          edge: {
            id: `posted_in:${g.id}:${refId}`,
            type: "posted_in",
            source: n.id,
            target: node.id,
          },
        });
      }
    }

    if (node.type === "reaction") {
      const rows = await this.sql<{
        greeting_id: string;
        message: string;
        person_id: string;
        display_name: string;
      }>`
        select g.id::text as greeting_id, g.message, p.id::text as person_id, p.display_name
        from greeting_reaction r
        join greeting g on g.id = r.greeting_id
        join person p on p.id = r.person_id
        where r.id = ${refId}::uuid`;
      for (const row of rows) {
        const g: GraphNode = {
          id: nodeId("greeting", row.greeting_id),
          type: "greeting",
          label: row.message.slice(0, 80),
        };
        const p: GraphNode = {
          id: nodeId("person", row.person_id),
          type: "person",
          label: row.display_name,
        };
        out.push({
          node: g,
          edge: {
            id: `reaction_on:${refId}:${row.greeting_id}`,
            type: "reaction_on",
            source: node.id,
            target: g.id,
          },
        });
        out.push({
          node: p,
          edge: {
            id: `reacted_to:${row.person_id}:${row.greeting_id}`,
            type: "reacted_to",
            source: p.id,
            target: g.id,
          },
        });
      }
    }

    return out;
  }
}
