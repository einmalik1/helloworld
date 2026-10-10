import { DatabaseError, NotFound, ValidationError } from "@helloworld/types";
import { err, ok, type Result } from "neverthrow";

import {
  isForeignKeyViolation,
  isUniqueViolation,
  type CreateGreetingReactionInput,
  type GreetingReactionRecord,
  type GreetingReactionStore,
  type ListGreetingReactionsQuery,
  type ListGreetingReactionsResult,
  type UpdateGreetingReactionInput,
} from "./types.js";

export type GreetingReactionError = NotFound | ValidationError | DatabaseError;

function requireEmoji(emoji: string | undefined): Result<void, ValidationError> {
  if (emoji !== undefined && emoji.trim().length === 0) {
    return err(new ValidationError("emoji must be non-empty"));
  }
  return ok(undefined);
}

export async function createGreetingReaction(
  store: GreetingReactionStore,
  input: CreateGreetingReactionInput,
): Promise<Result<GreetingReactionRecord, GreetingReactionError>> {
  const emoji = input.emoji.trim();
  if (emoji.length === 0) {
    return err(new ValidationError("emoji must be non-empty"));
  }

  try {
    const reaction = await store.insert({
      greeting_id: input.greeting_id,
      person_id: input.person_id,
      emoji,
    });
    return ok(reaction);
  } catch (e) {
    if (isUniqueViolation(e)) {
      return err(new ValidationError("reaction already exists"));
    }
    if (isForeignKeyViolation(e)) {
      return err(new NotFound("Greeting or person not found"));
    }
    return err(new DatabaseError("Failed to create greeting reaction", e));
  }
}

export async function getGreetingReaction(
  store: GreetingReactionStore,
  id: string,
): Promise<Result<GreetingReactionRecord, GreetingReactionError>> {
  try {
    const reaction = await store.findById(id);
    if (!reaction) {
      return err(new NotFound(`Greeting reaction ${id} not found`));
    }
    return ok(reaction);
  } catch (e) {
    return err(new DatabaseError("Failed to get greeting reaction", e));
  }
}

export async function listGreetingReactions(
  store: GreetingReactionStore,
  query: ListGreetingReactionsQuery,
): Promise<Result<ListGreetingReactionsResult, GreetingReactionError>> {
  const page = query.page < 1 ? 1 : query.page;
  const limit = Math.min(Math.max(query.limit, 1), 100);

  try {
    const { items, total } = await store.list({ page, limit });
    return ok({ items, total, page, limit });
  } catch (e) {
    return err(new DatabaseError("Failed to list greeting reactions", e));
  }
}

export async function updateGreetingReaction(
  store: GreetingReactionStore,
  id: string,
  input: UpdateGreetingReactionInput,
): Promise<Result<GreetingReactionRecord, GreetingReactionError>> {
  const emojiCheck = requireEmoji(input.emoji);
  if (emojiCheck.isErr()) {
    return err(emojiCheck.error);
  }

  const patch: UpdateGreetingReactionInput = {};
  if (input.greeting_id !== undefined) {
    patch.greeting_id = input.greeting_id;
  }
  if (input.person_id !== undefined) {
    patch.person_id = input.person_id;
  }
  if (input.emoji !== undefined) {
    patch.emoji = input.emoji.trim();
  }

  try {
    const reaction = await store.update(id, patch);
    if (!reaction) {
      return err(new NotFound(`Greeting reaction ${id} not found`));
    }
    return ok(reaction);
  } catch (e) {
    if (isUniqueViolation(e)) {
      return err(new ValidationError("reaction already exists"));
    }
    if (isForeignKeyViolation(e)) {
      return err(new NotFound("Greeting or person not found"));
    }
    return err(new DatabaseError("Failed to update greeting reaction", e));
  }
}

export async function deleteGreetingReaction(
  store: GreetingReactionStore,
  id: string,
): Promise<Result<void, GreetingReactionError>> {
  try {
    const deleted = await store.delete(id);
    if (!deleted) {
      return err(new NotFound(`Greeting reaction ${id} not found`));
    }
    return ok(undefined);
  } catch (e) {
    return err(new DatabaseError("Failed to delete greeting reaction", e));
  }
}
