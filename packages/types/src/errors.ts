/** Base for typed domain/service errors mapped by the API exception filter. */
export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

/** Resource or entity missing — maps to HTTP 404. */
export class NotFound extends AppError {
  constructor(message = "Resource not found") {
    super(message, "not_found");
  }
}

/** Input/domain validation failure — maps to HTTP 400. */
export class ValidationError extends AppError {
  readonly issues?: unknown;

  constructor(message = "Validation failed", issues?: unknown) {
    super(message, "validation");
    this.issues = issues;
  }
}

/** Persistence failure — maps to HTTP 500. */
export class DatabaseError extends AppError {
  readonly cause?: unknown;

  constructor(message = "Database error", cause?: unknown) {
    super(message, "database");
    this.cause = cause;
  }
}
