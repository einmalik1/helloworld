import type {
  CreateGreetingReaction,
  UpdateGreetingReaction,
} from "@helloworld/types/api";

/** Persisted greeting reaction row returned from the store / use-cases. */
export type GreetingReactionRecord = {
  id: string;
  greeting_id: string;
  person_id: string;
  emoji: string;
  created_at: Date;
};

export type CreateGreetingReactionInput = CreateGreetingReaction;
export type UpdateGreetingReactionInput = UpdateGreetingReaction;

export type ListGreetingReactionsQuery = {
  page: number;
  limit: number;
};

export type ListGreetingReactionsResult = {
  items: GreetingReactionRecord[];
  total: number;
  page: number;
  limit: number;
};

/** Persistence port for GreetingReaction use-cases (DB adapter implements this). */
export type GreetingReactionStore = {
  insert(input: CreateGreetingReactionInput): Promise<GreetingReactionRecord>;
  findById(id: string): Promise<GreetingReactionRecord | null>;
  list(
    query: ListGreetingReactionsQuery,
  ): Promise<{ items: GreetingReactionRecord[]; total: number }>;
  update(
    id: string,
    input: UpdateGreetingReactionInput,
  ): Promise<GreetingReactionRecord | null>;
  delete(id: string): Promise<boolean>;
};

function readPgCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let i = 0; i < 4 && current && typeof current === "object"; i += 1) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") {
      return code;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

/** True when the underlying driver reports a unique-constraint violation. */
export function isUniqueViolation(error: unknown): boolean {
  return readPgCode(error) === "23505";
}

/** True when the underlying driver reports a foreign-key violation. */
export function isForeignKeyViolation(error: unknown): boolean {
  return readPgCode(error) === "23503";
}
