import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import {
  AuthModule,
  DatabaseModule,
  HealthModule,
  createAppConfigModule,
  createLoggerModule,
} from "@helloworld/modules";

import { envSchema } from "./configuration.js";
import { JobsModule } from "./jobs/jobs.module.js";

@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    AuthModule,
    DatabaseModule,
    HealthModule,
    createLoggerModule(),
    ScheduleModule.forRoot(),
    JobsModule,
  ],
})
export class AppModule {}
