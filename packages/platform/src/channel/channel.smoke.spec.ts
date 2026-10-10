import { ValidationError } from "@helloworld/types";
import { describe, expect, it } from "vitest";

import {
  createChannel,
  listChannels,
} from "./channel.js";
import type { ChannelRecord, ChannelRepository } from "./types.js";
import { UniqueSlugError } from "./types.js";

function createMemoryRepo(): ChannelRepository {
  const rows = new Map<string, ChannelRecord>();

  return {
    async insert(input) {
      for (const row of rows.values()) {
        if (row.slug === input.slug) {
          throw new UniqueSlugError();
        }
      }
      const record: ChannelRecord = {
        id: crypto.randomUUID(),
        slug: input.slug,
        name: input.name,
        created_at: new Date(),
      };
      rows.set(record.id, record);
      return record;
    },
    async findById(id) {
      return rows.get(id) ?? null;
    },
    async list({ page, limit }) {
      const all = [...rows.values()].sort((a, b) =>
        a.created_at.getTime() - b.created_at.getTime(),
      );
      const start = (page - 1) * limit;
      return { items: all.slice(start, start + limit), total: all.length };
    },
    async update(id, input) {
      const existing = rows.get(id);
      if (!existing) {
        return null;
      }
      if (input.slug !== undefined) {
        for (const row of rows.values()) {
          if (row.id !== id && row.slug === input.slug) {
            throw new UniqueSlugError();
          }
        }
      }
      const next: ChannelRecord = {
        ...existing,
        slug: input.slug ?? existing.slug,
        name: input.name ?? existing.name,
      };
      rows.set(id, next);
      return next;
    },
    async delete(id) {
      return rows.delete(id);
    },
  };
}

describe("platform channel use-cases smoke", () => {
  it("lists a channel after create", async () => {
    const repo = createMemoryRepo();
    const created = await createChannel(repo, { slug: "web", name: "Web" });
    expect(created.isOk()).toBe(true);
    if (created.isErr()) {
      return;
    }

    const listed = await listChannels(repo, { page: 1, limit: 20 });
    expect(listed.isOk()).toBe(true);
    if (listed.isErr()) {
      return;
    }
    expect(listed.value.total).toBe(1);
    expect(listed.value.items[0]?.id).toBe(created.value.id);
    expect(listed.value.items[0]?.slug).toBe("web");
  });

  it("maps duplicate slug to ValidationError", async () => {
    const repo = createMemoryRepo();
    const first = await createChannel(repo, { slug: "cli", name: "CLI" });
    expect(first.isOk()).toBe(true);

    const second = await createChannel(repo, { slug: "cli", name: "CLI 2" });
    expect(second.isErr()).toBe(true);
    if (second.isOk()) {
      return;
    }
    expect(second.error).toBeInstanceOf(ValidationError);
    expect(second.error.code).toBe("validation");
  });
});
