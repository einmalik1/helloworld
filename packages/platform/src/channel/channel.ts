import {
  DatabaseError,
  NotFound,
  ValidationError,
} from "@helloworld/types";
import type { CreateChannel, UpdateChannel } from "@helloworld/types/api";
import { err, ok, type Result } from "neverthrow";

import type {
  ChannelListQuery,
  ChannelListResult,
  ChannelRecord,
  ChannelRepository,
} from "./types.js";
import { UniqueSlugError } from "./types.js";

export type ChannelError = NotFound | ValidationError | DatabaseError;

function mapRepoError(e: unknown, fallback: string): ChannelError {
  if (e instanceof UniqueSlugError) {
    return new ValidationError(e.message);
  }
  if (e instanceof NotFound) {
    return e;
  }
  if (e instanceof ValidationError) {
    return e;
  }
  if (e instanceof DatabaseError) {
    return e;
  }
  return new DatabaseError(fallback, e);
}

export async function createChannel(
  repo: ChannelRepository,
  input: CreateChannel,
): Promise<Result<ChannelRecord, ChannelError>> {
  try {
    const row = await repo.insert(input);
    return ok(row);
  } catch (e) {
    return err(mapRepoError(e, "Failed to create channel"));
  }
}

export async function getChannel(
  repo: ChannelRepository,
  id: string,
): Promise<Result<ChannelRecord, ChannelError>> {
  try {
    const row = await repo.findById(id);
    if (!row) {
      return err(new NotFound(`Channel ${id} not found`));
    }
    return ok(row);
  } catch (e) {
    return err(mapRepoError(e, "Failed to get channel"));
  }
}

export async function listChannels(
  repo: ChannelRepository,
  query: ChannelListQuery,
): Promise<Result<ChannelListResult, ChannelError>> {
  const page = Math.max(1, query.page);
  const limit = Math.min(100, Math.max(1, query.limit));
  try {
    const { items, total } = await repo.list({ page, limit });
    return ok({ items, total, page, limit });
  } catch (e) {
    return err(mapRepoError(e, "Failed to list channels"));
  }
}

export async function updateChannel(
  repo: ChannelRepository,
  id: string,
  input: UpdateChannel,
): Promise<Result<ChannelRecord, ChannelError>> {
  try {
    const row = await repo.update(id, input);
    if (!row) {
      return err(new NotFound(`Channel ${id} not found`));
    }
    return ok(row);
  } catch (e) {
    return err(mapRepoError(e, "Failed to update channel"));
  }
}

export async function deleteChannel(
  repo: ChannelRepository,
  id: string,
): Promise<Result<void, ChannelError>> {
  try {
    const deleted = await repo.delete(id);
    if (!deleted) {
      return err(new NotFound(`Channel ${id} not found`));
    }
    return ok(undefined);
  } catch (e) {
    return err(mapRepoError(e, "Failed to delete channel"));
  }
}
