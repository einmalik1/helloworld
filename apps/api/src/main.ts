import "reflect-metadata";
import "./preload-env.js";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  AUTH_INSTANCE,
  mountBetterAuth,
  setupOpenApi,
  type AuthInstance,
} from "@helloworld/modules";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { ZodValidationPipe } from "nestjs-zod";

import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";
import { requestIdMiddleware } from "./common/middleware/request-id.middleware.js";
import type { AppConfig } from "./configuration.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  app.use(helmet());
  app.use(requestIdMiddleware);

  const configService = app.get(ConfigService<AppConfig, true>);
  const webOrigin = configService.get("WEB_ORIGIN", { infer: true });
  app.enableCors({ origin: webOrigin, credentials: true });

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const auth = app.get<AuthInstance>(AUTH_INSTANCE);
  mountBetterAuth(app, auth);

  setupOpenApi(app, {
    title: "Hello World API",
    description: "REST API",
  });

  const host = configService.get("API_HOST", { infer: true });
  const port = configService.get("API_PORT", { infer: true });
  await app.listen(port, host);
}

void bootstrap();
