import { Module } from "@nestjs/common";
import {
  AuthModule,
  DatabaseModule,
  HealthModule,
  createAppConfigModule,
  createLoggerModule,
} from "@helloworld/modules";

import { envSchema } from "./configuration.js";
import { GreetingReactionModule } from "./greeting-reaction/greeting-reaction.module.js";

@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    AuthModule,
    DatabaseModule,
    HealthModule,
    createLoggerModule(),
    GreetingReactionModule,
  ],
})
export class AppModule {}
