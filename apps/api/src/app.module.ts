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
import { GreetingModule } from "./greeting/greeting.module.js";
import { ImpexModule } from "./impex/impex.module.js";
import { PersonModule } from "./person/person.module.js";
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
    PersonModule,
    GreetingModule,
    ImpexModule,
  ],
})
export class AppModule {}

