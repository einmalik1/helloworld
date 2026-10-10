import type { CreatePerson, UpdatePerson } from "@helloworld/types/api";

/** Persisted person row returned from the store / use-cases. */
export type PersonRecord = {
  id: string;
  display_name: string;
  email: string;
  created_at: Date;
};

export type CreatePersonInput = CreatePerson;
export type UpdatePersonInput = UpdatePerson;

export type ListPersonsQuery = {
  page: number;
  limit: number;
};

export type ListPersonsResult = {
  items: PersonRecord[];
  total: number;
  page: number;
  limit: number;
};

/** Persistence port for Person use-cases (DB adapter implements this). */
export type PersonStore = {
  insert(input: CreatePersonInput): Promise<PersonRecord>;
  findById(id: string): Promise<PersonRecord | null>;
  list(query: ListPersonsQuery): Promise<{ items: PersonRecord[]; total: number }>;
  update(id: string, input: UpdatePersonInput): Promise<PersonRecord | null>;
  delete(id: string): Promise<boolean>;
};

/** True when the underlying driver reports a unique-constraint violation. */
export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const code =
    "code" in error && typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : undefined;
  if (code === "23505") {
    return true;
  }
  const cause = "cause" in error ? (error as { cause: unknown }).cause : undefined;
  if (cause !== undefined && cause !== error) {
    return isUniqueViolation(cause);
  }
  return false;
}
