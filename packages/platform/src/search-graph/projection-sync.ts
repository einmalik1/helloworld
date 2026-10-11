import { AgeProjection, type AgeSql } from "./age-projection.js";
import type { ProjectionSync, SearchIndex, SearchSyncOutbox } from "./ports.js";
import type { SqlExecutor } from "./relational-graph-store.js";
import type { EntityType, OutboxRow } from "./types.js";

function docId(type: EntityType, id: string): string {
  return `${type}:${id}`;
}

export class SearchGraphProjectionSync implements ProjectionSync {
  private readonly age: AgeProjection;

  constructor(
    private readonly sql: SqlExecutor & AgeSql,
    private readonly search: SearchIndex,
    private readonly outbox: SearchSyncOutbox,
  ) {
    this.age = new AgeProjection(sql);
  }

  async drainPending(limit = 50): Promise<number> {
    const rows = await this.outbox.listPending(limit);
    for (const row of rows) {
      await this.applyOutboxRow(row);
      await this.outbox.markProcessed(row.id);
    }
    return rows.length;
  }

  async applyOutboxRow(row: OutboxRow): Promise<void> {
    if (row.op === "delete") {
      await this.age.deleteVertex(row.aggregateType, row.aggregateId);
      await this.search.deleteDocument(docId(row.aggregateType, row.aggregateId));
      return;
    }
    await this.projectEntity(row.aggregateType, row.aggregateId);
  }

  async rebuild(): Promise<{ nodes: number; documents: number }> {
    await this.age.clearGraph();
    await this.search.ensureCollection();

    let nodes = 0;
    let documents = 0;

    const people = await this.sql<{ id: string; display_name: string; email: string }>`
      select id::text, display_name, email from person`;
    for (const p of people) {
      await this.projectPerson(p);
      nodes += 1;
      documents += 1;
    }

    const channels = await this.sql<{ id: string; name: string; slug: string }>`
      select id::text, name, slug from channel`;
    for (const c of channels) {
      await this.projectChannel(c);
      nodes += 1;
      documents += 1;
    }

    const greetings = await this.sql<{
      id: string;
      message: string;
      author_id: string;
      channel_id: string;
    }>`
      select id::text, message, author_id::text, channel_id::text from greeting`;
    for (const g of greetings) {
      await this.projectGreeting(g);
      nodes += 1;
      documents += 1;
    }

    const reactions = await this.sql<{
      id: string;
      emoji: string;
      greeting_id: string;
      person_id: string;
    }>`
      select id::text, emoji, greeting_id::text, person_id::text from greeting_reaction`;
    for (const r of reactions) {
      await this.projectReaction(r);
      nodes += 1;
      documents += 1;
    }

    return { nodes, documents };
  }

  private async projectEntity(type: EntityType, id: string): Promise<void> {
    switch (type) {
      case "person": {
        const rows = await this.sql<{ id: string; display_name: string; email: string }>`
          select id::text, display_name, email from person where id = ${id}::uuid`;
        const row = rows[0];
        if (row) await this.projectPerson(row);
        break;
      }
      case "channel": {
        const rows = await this.sql<{ id: string; name: string; slug: string }>`
          select id::text, name, slug from channel where id = ${id}::uuid`;
        const row = rows[0];
        if (row) await this.projectChannel(row);
        break;
      }
      case "greeting": {
        const rows = await this.sql<{
          id: string;
          message: string;
          author_id: string;
          channel_id: string;
        }>`
          select id::text, message, author_id::text, channel_id::text
          from greeting where id = ${id}::uuid`;
        const row = rows[0];
        if (row) await this.projectGreeting(row);
        break;
      }
      case "reaction": {
        const rows = await this.sql<{
          id: string;
          emoji: string;
          greeting_id: string;
          person_id: string;
        }>`
          select id::text, emoji, greeting_id::text, person_id::text
          from greeting_reaction where id = ${id}::uuid`;
        const row = rows[0];
        if (row) await this.projectReaction(row);
        break;
      }
    }
  }

  private async projectPerson(p: {
    id: string;
    display_name: string;
    email: string;
  }): Promise<void> {
    await this.age.upsertVertex("person", p.id, {
      title: p.display_name,
      email: p.email,
    });
    await this.search.upsertDocument({
      id: docId("person", p.id),
      type: "person",
      title: p.display_name,
      body: p.email,
      refId: p.id,
      updatedAt: new Date().toISOString(),
    });
  }

  private async projectChannel(c: { id: string; name: string; slug: string }): Promise<void> {
    await this.age.upsertVertex("channel", c.id, {
      title: c.name,
      slug: c.slug,
    });
    await this.search.upsertDocument({
      id: docId("channel", c.id),
      type: "channel",
      title: c.name,
      body: c.slug,
      refId: c.id,
      updatedAt: new Date().toISOString(),
    });
  }

  private async projectGreeting(g: {
    id: string;
    message: string;
    author_id: string;
    channel_id: string;
  }): Promise<void> {
    await this.age.upsertVertex("greeting", g.id, { title: g.message.slice(0, 120) });
    await this.age.upsertEdge("authored", "person", g.author_id, "greeting", g.id);
    await this.age.upsertEdge("posted_in", "greeting", g.id, "channel", g.channel_id);
    await this.search.upsertDocument({
      id: docId("greeting", g.id),
      type: "greeting",
      title: g.message.slice(0, 120),
      body: g.message,
      refId: g.id,
      updatedAt: new Date().toISOString(),
    });
  }

  private async projectReaction(r: {
    id: string;
    emoji: string;
    greeting_id: string;
    person_id: string;
  }): Promise<void> {
    await this.age.upsertVertex("reaction", r.id, { title: r.emoji });
    await this.age.upsertEdge("reaction_on", "reaction", r.id, "greeting", r.greeting_id);
    await this.age.upsertEdge("reacted_to", "person", r.person_id, "greeting", r.greeting_id);
    await this.search.upsertDocument({
      id: docId("reaction", r.id),
      type: "reaction",
      title: r.emoji,
      refId: r.id,
      updatedAt: new Date().toISOString(),
    });
  }
}
