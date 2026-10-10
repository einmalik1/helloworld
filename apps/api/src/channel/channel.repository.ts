import {
  DatabaseService,
  UniqueConstraintError,
} from "@helloworld/modules";
import {
  UniqueSlugError,
  type ChannelRecord,
  type ChannelRepository,
  type CreateChannel,
  type UpdateChannel,
} from "@helloworld/platform";

function toRecord(row: {
  id: string;
  slug: string;
  name: string;
  created_at: Date;
}): ChannelRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    created_at: row.created_at,
  };
}

/** Adapts Nest DatabaseService channel queries to the platform ChannelRepository port. */
export function createChannelRepository(db: DatabaseService): ChannelRepository {
  return {
    async insert(input: CreateChannel): Promise<ChannelRecord> {
      try {
        return toRecord(await db.insertChannel(input));
      } catch (error) {
        if (error instanceof UniqueConstraintError && error.field === "slug") {
          throw new UniqueSlugError();
        }
        throw error;
      }
    },

    async findById(id: string): Promise<ChannelRecord | null> {
      const row = await db.findChannelById(id);
      return row ? toRecord(row) : null;
    },

    async list(query) {
      const { items, total } = await db.listChannels(query.page, query.limit);
      return { items: items.map(toRecord), total };
    },

    async update(id: string, input: UpdateChannel): Promise<ChannelRecord | null> {
      try {
        const row = await db.updateChannel(id, input);
        return row ? toRecord(row) : null;
      } catch (error) {
        if (error instanceof UniqueConstraintError && error.field === "slug") {
          throw new UniqueSlugError();
        }
        throw error;
      }
    },

    async delete(id: string): Promise<boolean> {
      return db.deleteChannel(id);
    },
  };
}
