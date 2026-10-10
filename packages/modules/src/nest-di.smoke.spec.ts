import "reflect-metadata";

import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { afterAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { createAppConfigModule } from "./config/create-app-config-module.js";
import { DatabaseModule } from "./database/database.module.js";
import { DatabaseService } from "./database/database.service.js";
import { HealthModule } from "./health/health.module.js";
import { Public, IS_PUBLIC_KEY } from "./auth/public.decorator.js";
import { setupOpenApi } from "./openapi/setup-open-api.js";
import { createLoggerModule } from "./logging/create-logger-module.js";

const smokeEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),
});

describe("Nest DI smoke (TS 7 + emitDecoratorMetadata)", () => {
  afterAll(() => {
    // ConfigModule may cache; leave process.env for other tests as set below.
  });

  it("wires config + database + health modules and Public metadata", async () => {
    process.env.DATABASE_URL ??=
      "postgresql://helloworld:helloworld@127.0.0.1:5432/helloworld";
    process.env.BETTER_AUTH_SECRET ??= "smoke-secret-change-me";
    process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
    process.env.WEB_ORIGIN ??= "http://localhost:5173";
    process.env.LOG_LEVEL ??= "info";
    process.env.NODE_ENV ??= "test";

    @Module({
      imports: [
        createAppConfigModule({ envSchema: smokeEnvSchema }),
        createLoggerModule(),
        DatabaseModule,
        HealthModule,
      ],
    })
    class SmokeModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [SmokeModule],
    }).compile();

    const config = moduleRef.get(ConfigService);
    expect(config.get("DATABASE_URL")).toBeTruthy();

    const database = moduleRef.get(DatabaseService);
    expect(database.db).toBeTruthy();

    class Sample {
      @Public()
      handler(): string {
        return "ok";
      }
    }
    const meta = Reflect.getMetadata(IS_PUBLIC_KEY, Sample.prototype.handler);
    expect(meta).toBe(true);

    expect(typeof setupOpenApi).toBe("function");

    await moduleRef.close();
  });
});
