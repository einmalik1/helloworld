import type { EntityType } from "./types.js";

const GRAPH = "helloworld";

function escapeCypherString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/** postgres.js client subset (tagged templates + unsafe for AGE Cypher literals). */
export type AgeSql = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  unsafe(query: string, parameters?: unknown[]): Promise<unknown>;
};

/**
 * AGE graph writer used by worker projection (Cypher stays server-side).
 */
export class AgeProjection {
  constructor(private readonly sql: AgeSql) {}

  async ensureReady(): Promise<void> {
    await this.sql`LOAD 'age'`;
    await this.sql`SET search_path = ag_catalog, "$user", public`;
    const existing = (await this.sql`
      select name::text from ag_catalog.ag_graph where name = ${GRAPH}`) as Array<{
      name: string;
    }>;
    if (existing.length === 0) {
      await this.sql.unsafe(`select create_graph('${GRAPH}')`);
    }
  }

  private async runCypher(cypher: string): Promise<void> {
    await this.ensureReady();
    await this.sql.unsafe(
      `select * from cypher('${GRAPH}', $cypher$${cypher}$cypher$) as (v agtype)`,
    );
  }

  async upsertVertex(type: EntityType, id: string, props: Record<string, string>): Promise<void> {
    const propPairs = Object.entries({ id, ...props })
      .map(([k, v]) => `${k}: '${escapeCypherString(v)}'`)
      .join(", ");
    await this.runCypher(`
      MERGE (n:${type} {id: '${escapeCypherString(id)}'})
      SET n = {${propPairs}}
      RETURN n
    `);
  }

  async deleteVertex(type: EntityType, id: string): Promise<void> {
    await this.runCypher(`
      MATCH (n:${type} {id: '${escapeCypherString(id)}'})
      DETACH DELETE n
      RETURN 1
    `);
  }

  async upsertEdge(
    edgeType: string,
    fromType: EntityType,
    fromId: string,
    toType: EntityType,
    toId: string,
  ): Promise<void> {
    await this.runCypher(`
      MATCH (a:${fromType} {id: '${escapeCypherString(fromId)}'})
      MATCH (b:${toType} {id: '${escapeCypherString(toId)}'})
      MERGE (a)-[r:${edgeType}]->(b)
      RETURN r
    `);
  }

  async clearGraph(): Promise<void> {
    await this.ensureReady();
    const existing = (await this.sql`
      select name::text from ag_catalog.ag_graph where name = ${GRAPH}`) as Array<{
      name: string;
    }>;
    if (existing.length > 0) {
      await this.sql.unsafe(`select drop_graph('${GRAPH}', true)`);
    }
    await this.sql.unsafe(`select create_graph('${GRAPH}')`);
  }
}
