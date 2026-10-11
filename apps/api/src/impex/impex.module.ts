import { Module } from "@nestjs/common";

import { ImpexController } from "./impex.controller.js";
import { ImpexRepository } from "./impex.repository.js";
import { ImpexService } from "./impex.service.js";

@Module({
  controllers: [ImpexController],
  providers: [ImpexRepository, ImpexService],
  exports: [ImpexService],
})
export class ImpexModule {}
