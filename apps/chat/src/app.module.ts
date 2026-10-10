import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth/auth.guard.js";
import { ChatController } from "./chat/chat.controller.js";
import { ChatService } from "./chat/chat.service.js";
import { HealthController } from "./health/health.controller.js";

@Module({
  controllers: [HealthController, ChatController],
  providers: [
    ChatService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
