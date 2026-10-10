import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

export type SetupOpenApiOptions = {
  title: string;
  description?: string;
  version?: string;
  /** Swagger UI path (default `/api/docs`). */
  docsPath?: string;
  /** OpenAPI JSON path (default `/openapi.json`). */
  jsonPath?: string;
};

/**
 * Configure Swagger UI + JSON export with nestjs-zod document cleanup.
 * Auth schemes match Better Auth (`x-api-key` + cookie session).
 */
export function setupOpenApi(
  app: INestApplication,
  options: SetupOpenApiOptions,
): void {
  const docsPath = options.docsPath ?? "api/docs";
  const jsonPath = options.jsonPath ?? "openapi.json";

  const builder = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description ?? "")
    .setVersion(options.version ?? "1.0")
    .addApiKey(
      {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "Better Auth managed API key",
      },
      "api-key",
    )
    .addCookieAuth("better-auth.session_token", {
      type: "apiKey",
      in: "cookie",
      name: "better-auth.session_token",
      description: "Better Auth session cookie (web)",
    })
    .build();

  const document = cleanupOpenApiDoc(
    SwaggerModule.createDocument(app, builder),
  );
  SwaggerModule.setup(docsPath, app, document, {
    jsonDocumentUrl: jsonPath,
  });
}
