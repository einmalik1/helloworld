import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log"] });
  const origin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
  app.enableCors({
    origin,
    credentials: true,
    allowedHeaders: ["Content-Type", "x-api-key", "x-person-id", "Authorization"],
  });
  const host = process.env.CHAT_HOST ?? "0.0.0.0";
  const port = Number(process.env.CHAT_PORT ?? "3200");
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`chat listening on http://${host}:${port}`);
}

bootstrap();
