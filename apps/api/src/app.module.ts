import { Module } from "@nestjs/common";
import {
  AuthModule,
  DatabaseModule,
  HealthModule,
  ObjectStorageModule,
  createAppConfigModule,
  createLoggerModule,
} from "@helloworld/modules";

import { envSchema } from "./configuration.js";
import { GraphModule } from "./graph/graph.module.js";
import { SearchModule } from "./search/search.module.js";

@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    AuthModule,
    DatabaseModule,
    HealthModule,
    ObjectStorageModule,
    createLoggerModule(),
    GraphModule,
    SearchModule,
  ],
})
export class AppModule {}
