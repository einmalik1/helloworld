import { Catch, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { DatabaseError, NotFound, ValidationError } from "@helloworld/types";
import type { Request, Response } from "express";
import { ZodValidationException } from "nestjs-zod";

import { readRequestId } from "../middleware/request-id.middleware.js";

type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  requestId: string;
  errors?: unknown;
};

const PROBLEM = {
  notFound: "urn:helloworld:problem:not-found",
  validation: "urn:helloworld:problem:validation",
  database: "urn:helloworld:problem:database",
  unauthorized: "urn:helloworld:problem:unauthorized",
  http: "urn:helloworld:problem:http",
  internal: "urn:helloworld:problem:internal",
} as const;

function extractZodIssues(
  zodError: unknown,
): Array<{ pointer: string; detail: string }> | undefined {
  if (
    typeof zodError !== "object" ||
    zodError === null ||
    !("issues" in zodError) ||
    !Array.isArray((zodError as { issues: unknown }).issues)
  ) {
    return undefined;
  }
  return (zodError as { issues: Array<{ path?: unknown; message?: unknown }> }).issues.map(
    (issue) => ({
      pointer: `/${Array.isArray(issue.path) ? issue.path.join("/") : ""}`,
      detail: typeof issue.message === "string" ? issue.message : "Invalid",
    }),
  );
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = readRequestId(request);

    const problem = this.toProblem(exception, requestId);

    if (problem.status >= 500) {
      this.logger.error({ requestId, err: exception }, problem.detail);
    } else {
      this.logger.warn({ requestId, status: problem.status }, problem.detail);
    }

    response.status(problem.status).type("application/problem+json").json(problem);
  }

  private toProblem(exception: unknown, requestId: string): ProblemDetails {
    if (exception instanceof NotFound) {
      return {
        type: PROBLEM.notFound,
        title: "Not Found",
        status: HttpStatus.NOT_FOUND,
        detail: exception.message,
        requestId,
      };
    }

    if (exception instanceof ValidationError) {
      return {
        type: PROBLEM.validation,
        title: "Bad Request",
        status: HttpStatus.BAD_REQUEST,
        detail: exception.message,
        requestId,
        ...(exception.issues !== undefined ? { errors: exception.issues } : {}),
      };
    }

    if (exception instanceof DatabaseError) {
      return {
        type: PROBLEM.database,
        title: "Internal Server Error",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: "A database error occurred",
        requestId,
      };
    }

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      const issues = extractZodIssues(zodError);
      return {
        type: PROBLEM.validation,
        title: "Bad Request",
        status: HttpStatus.BAD_REQUEST,
        detail: "Validation failed",
        requestId,
        ...(issues !== undefined ? { errors: issues } : {}),
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const detail =
        typeof body === "string"
          ? body
          : typeof body === "object" &&
              body !== null &&
              "message" in body &&
              typeof (body as { message: unknown }).message === "string"
            ? (body as { message: string }).message
            : exception.message;

      const type =
        status === HttpStatus.UNAUTHORIZED
          ? PROBLEM.unauthorized
          : status === HttpStatus.BAD_REQUEST
            ? PROBLEM.validation
            : status === HttpStatus.NOT_FOUND
              ? PROBLEM.notFound
              : PROBLEM.http;

      return {
        type,
        title: HttpStatus[status] ?? "Error",
        status,
        detail,
        requestId,
      };
    }

    return {
      type: PROBLEM.internal,
      title: "Internal Server Error",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: "An unexpected error occurred",
      requestId,
    };
  }
}
