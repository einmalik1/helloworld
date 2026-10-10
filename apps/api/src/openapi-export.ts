import "reflect-metadata";
import "./preload-env.js";

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

import { AppModule } from "./app.module.js";

async function exportOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });

  const builder = new DocumentBuilder()
    .setTitle("Hello World API")
    .setDescription("REST API")
    .setVersion("1.0")
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

  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, builder));

  const outPath = resolve(process.cwd(), "apps/api/openapi.json");
  await writeFile(outPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  await app.close();
  console.log(`Wrote ${outPath}`);
}

void exportOpenApi().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
