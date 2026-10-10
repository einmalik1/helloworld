import { DatabaseError, NotFound } from "@helloworld/types";

/** Postgres SQLSTATE for foreign_key_violation. */
const PG_FOREIGN_KEY_VIOLATION = "23503";

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

/** Map driver/ORM failures to typed platform errors. */
export function mapGreetingDbError(error: unknown): DatabaseError | NotFound {
  if (readPgCode(error) === PG_FOREIGN_KEY_VIOLATION) {
    return new NotFound("Author or channel not found");
  }
  return new DatabaseError("Greeting persistence failed", error);
}
