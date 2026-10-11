import { Module } from "@nestjs/common";

import { ImpexJob } from "./impex.job.js";
import { JobsController } from "./jobs.controller.js";
import { JobsRepository } from "./jobs.repository.js";
import { OutboxDrainJob } from "./outbox-drain.job.js";

@Module({
  controllers: [JobsController],
  providers: [JobsRepository, OutboxDrainJob, ImpexJob],
  exports: [JobsRepository],
})
export class JobsModule {}
