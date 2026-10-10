import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@helloworld/modules";
import {
  createPerson,
  deletePerson,
  getPerson,
  listPersons,
  updatePerson,
  type ListPersonsResult,
  type PersonRecord,
  type PersonStore,
} from "@helloworld/platform";
import type { CreatePerson, UpdatePerson } from "@helloworld/types/api";

@Injectable()
export class PersonService {
  constructor(private readonly database: DatabaseService) {}

  private store(): PersonStore {
    const db = this.database;
    return {
      insert: (input) => db.insertPerson(input),
      findById: (id) => db.findPersonById(id),
      list: ({ page, limit }) => db.listPersons(page, limit),
      update: (id, input) => db.updatePerson(id, input),
      delete: (id) => db.deletePerson(id),
    };
  }

  async create(input: CreatePerson): Promise<PersonRecord> {
    const result = await createPerson(this.store(), input);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  async getById(id: string): Promise<PersonRecord> {
    const result = await getPerson(this.store(), id);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  async list(page: number, limit: number): Promise<ListPersonsResult> {
    const result = await listPersons(this.store(), { page, limit });
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  async update(id: string, input: UpdatePerson): Promise<PersonRecord> {
    const result = await updatePerson(this.store(), id, input);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  async remove(id: string): Promise<void> {
    const result = await deletePerson(this.store(), id);
    if (result.isErr()) {
      throw result.error;
    }
  }
}
