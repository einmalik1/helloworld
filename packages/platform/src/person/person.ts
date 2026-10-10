import { DatabaseError, NotFound, ValidationError } from "@helloworld/types";
import { err, ok, type Result } from "neverthrow";

import {
  isUniqueViolation,
  type CreatePersonInput,
  type ListPersonsQuery,
  type ListPersonsResult,
  type PersonRecord,
  type PersonStore,
  type UpdatePersonInput,
} from "./types.js";

export type PersonError = NotFound | ValidationError | DatabaseError;

function requireDisplayName(displayName: string | undefined): Result<void, ValidationError> {
  if (displayName !== undefined && displayName.trim().length === 0) {
    return err(new ValidationError("display_name must be non-empty"));
  }
  return ok(undefined);
}

export async function createPerson(
  store: PersonStore,
  input: CreatePersonInput,
): Promise<Result<PersonRecord, PersonError>> {
  if (input.display_name.trim().length === 0) {
    return err(new ValidationError("display_name must be non-empty"));
  }

  try {
    const person = await store.insert({
      display_name: input.display_name.trim(),
      email: input.email.trim(),
    });
    return ok(person);
  } catch (e) {
    if (isUniqueViolation(e)) {
      return err(new ValidationError("email already exists"));
    }
    return err(new DatabaseError("Failed to create person", e));
  }
}

export async function getPerson(
  store: PersonStore,
  id: string,
): Promise<Result<PersonRecord, PersonError>> {
  try {
    const person = await store.findById(id);
    if (!person) {
      return err(new NotFound(`Person ${id} not found`));
    }
    return ok(person);
  } catch (e) {
    return err(new DatabaseError("Failed to get person", e));
  }
}

export async function listPersons(
  store: PersonStore,
  query: ListPersonsQuery,
): Promise<Result<ListPersonsResult, PersonError>> {
  const page = query.page < 1 ? 1 : query.page;
  const limit = Math.min(Math.max(query.limit, 1), 100);

  try {
    const { items, total } = await store.list({ page, limit });
    return ok({ items, total, page, limit });
  } catch (e) {
    return err(new DatabaseError("Failed to list persons", e));
  }
}

export async function updatePerson(
  store: PersonStore,
  id: string,
  input: UpdatePersonInput,
): Promise<Result<PersonRecord, PersonError>> {
  const nameCheck = requireDisplayName(input.display_name);
  if (nameCheck.isErr()) {
    return err(nameCheck.error);
  }

  const patch: UpdatePersonInput = {};
  if (input.display_name !== undefined) {
    patch.display_name = input.display_name.trim();
  }
  if (input.email !== undefined) {
    patch.email = input.email.trim();
  }

  try {
    const person = await store.update(id, patch);
    if (!person) {
      return err(new NotFound(`Person ${id} not found`));
    }
    return ok(person);
  } catch (e) {
    if (isUniqueViolation(e)) {
      return err(new ValidationError("email already exists"));
    }
    return err(new DatabaseError("Failed to update person", e));
  }
}

export async function deletePerson(
  store: PersonStore,
  id: string,
): Promise<Result<void, PersonError>> {
  try {
    const deleted = await store.delete(id);
    if (!deleted) {
      return err(new NotFound(`Person ${id} not found`));
    }
    return ok(undefined);
  } catch (e) {
    return err(new DatabaseError("Failed to delete person", e));
  }
}
