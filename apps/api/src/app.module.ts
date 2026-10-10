import { Module } from "@nestjs/common";
import {
  AuthModule,
  DatabaseModule,
  HealthModule,
  createAppConfigModule,
  createLoggerModule,
} from "@helloworld/modules";

import { ChannelModule } from "./channel/channel.module.js";
import { envSchema } from "./configuration.js";

@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    AuthModule,
    DatabaseModule,
    HealthModule,
    createLoggerModule(),
    ChannelModule,
  ],
})
export class AppModule {}
