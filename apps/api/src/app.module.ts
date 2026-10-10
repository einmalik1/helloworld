import { Module } from "@nestjs/common";
import {
  AuthModule,
  DatabaseModule,
  HealthModule,
  createAppConfigModule,
  createLoggerModule,
} from "@helloworld/modules";

import { envSchema } from "./configuration.js";
import { GreetingModule } from "./greeting/greeting.module.js";

@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    AuthModule,
    DatabaseModule,
    HealthModule,
    createLoggerModule(),
    GreetingModule,
  ],
})
export class AppModule {}
