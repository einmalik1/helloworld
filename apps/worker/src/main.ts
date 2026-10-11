import "reflect-metadata";
import "./preload-env.js";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  AUTH_INSTANCE,
  mountBetterAuth,
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

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const auth = app.get<AuthInstance>(AUTH_INSTANCE);
  mountBetterAuth(app, auth);

  const configService = app.get(ConfigService<AppConfig, true>);
  const host = configService.get("WORKER_HOST", { infer: true });
  const port = configService.get("WORKER_PORT", { infer: true });
  await app.listen(port, host);
}

void bootstrap();
