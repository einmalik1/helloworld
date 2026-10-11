import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { DatabaseModule, createAppConfigModule, createLoggerModule } from "@helloworld/modules";

import { envSchema } from "./configuration.js";
import { ProjectionModule } from "./projection/projection.module.js";

@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    DatabaseModule,
    createLoggerModule(),
    ScheduleModule.forRoot(),
    ProjectionModule,
  ],
})
export class AppModule {}
