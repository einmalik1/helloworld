import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { DatabaseHealthIndicator } from "./database.health.js";
import { HealthController } from "./health.controller.js";
import { TypesenseHealthIndicator } from "./typesense.health.js";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, TypesenseHealthIndicator],
})
export class HealthModule {}
