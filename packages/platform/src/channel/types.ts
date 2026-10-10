import type { CreateChannel, UpdateChannel } from "@helloworld/types/api";

/** Persisted channel row (id / created_at always present after insert). */
export type ChannelRecord = {
  id: string;
  slug: string;
  name: string;
  created_at: Date;
};

export type ChannelListQuery = {
  page: number;
  limit: number;
};

export type ChannelListResult = {
  items: ChannelRecord[];
  total: number;
  page: number;
  limit: number;
};

export type { CreateChannel, UpdateChannel };

/** Thrown by repository adapters when channel.slug uniqueness is violated. */
export class UniqueSlugError extends Error {
  constructor(message = "Channel slug already exists") {
    super(message);
    this.name = "UniqueSlugError";
  }
}

export type ChannelRepository = {
  insert(input: CreateChannel): Promise<ChannelRecord>;
  findById(id: string): Promise<ChannelRecord | null>;
  list(query: ChannelListQuery): Promise<{ items: ChannelRecord[]; total: number }>;
  update(id: string, input: UpdateChannel): Promise<ChannelRecord | null>;
  delete(id: string): Promise<boolean>;
};
