import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@helloworld/modules";
import {
  createGreetingReaction,
  deleteGreetingReaction,
  getGreetingReaction,
  listGreetingReactions,
  updateGreetingReaction,
  type GreetingReactionRecord,
  type GreetingReactionStore,
  type ListGreetingReactionsResult,
} from "@helloworld/platform";
import type {
  CreateGreetingReaction,
  UpdateGreetingReaction,
} from "@helloworld/types/api";

@Injectable()
export class GreetingReactionService {
  constructor(private readonly database: DatabaseService) {}

  private store(): GreetingReactionStore {
    const db = this.database;
    return {
      insert: (input) => db.insertGreetingReaction(input),
      findById: (id) => db.findGreetingReactionById(id),
      list: ({ page, limit }) => db.listGreetingReactions(page, limit),
      update: (id, input) => db.updateGreetingReaction(id, input),
      delete: (id) => db.deleteGreetingReaction(id),
    };
  }

  async create(input: CreateGreetingReaction): Promise<GreetingReactionRecord> {
    const result = await createGreetingReaction(this.store(), input);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  async getById(id: string): Promise<GreetingReactionRecord> {
    const result = await getGreetingReaction(this.store(), id);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  async list(page: number, limit: number): Promise<ListGreetingReactionsResult> {
    const result = await listGreetingReactions(this.store(), { page, limit });
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  async update(
    id: string,
    input: UpdateGreetingReaction,
  ): Promise<GreetingReactionRecord> {
    const result = await updateGreetingReaction(this.store(), id, input);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  async remove(id: string): Promise<void> {
    const result = await deleteGreetingReaction(this.store(), id);
    if (result.isErr()) {
      throw result.error;
    }
  }
}
