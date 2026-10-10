import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@helloworld/modules";
import {
  createGreeting,
  deleteGreeting,
  getGreeting,
  listGreetings,
  updateGreeting,
  type ListGreetingsPage,
  type ListGreetingsQuery,
} from "@helloworld/platform";
import type { CreateGreeting, GreetingResponse, UpdateGreeting } from "@helloworld/types/api";
import type { DatabaseError, NotFound } from "@helloworld/types";
import type { Result } from "neverthrow";

@Injectable()
export class GreetingService {
  constructor(private readonly database: DatabaseService) {}

  create(input: CreateGreeting): Promise<Result<GreetingResponse, DatabaseError | NotFound>> {
    return createGreeting(this.database.db, input);
  }

  findOne(id: string): Promise<Result<GreetingResponse, DatabaseError | NotFound>> {
    return getGreeting(this.database.db, id);
  }

  findAll(query: ListGreetingsQuery): Promise<Result<ListGreetingsPage, DatabaseError>> {
    return listGreetings(this.database.db, query);
  }

  update(
    id: string,
    input: UpdateGreeting,
  ): Promise<Result<GreetingResponse, DatabaseError | NotFound>> {
    return updateGreeting(this.database.db, id, input);
  }

  remove(id: string): Promise<Result<void, DatabaseError | NotFound>> {
    return deleteGreeting(this.database.db, id);
  }
}
