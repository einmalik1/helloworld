import { Module } from "@nestjs/common";

import { JobsController } from "./jobs.controller.js";
import { JobsRepository } from "./jobs.repository.js";
import { OutboxDrainJob } from "./outbox-drain.job.js";

@Module({
  controllers: [JobsController],
  providers: [JobsRepository, OutboxDrainJob],
  exports: [JobsRepository],
})
export class JobsModule {}
