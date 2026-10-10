import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from "@nestjs/terminus";

import { Public } from "../auth/public.decorator.js";
import { DatabaseHealthIndicator } from "./database.health.js";

@Controller("health")
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.healthIndicatorService.check("process").up(),
      () => this.database.isHealthy("database"),
    ]);
  }
}
