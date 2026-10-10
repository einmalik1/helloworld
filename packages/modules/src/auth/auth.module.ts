import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { DatabaseService } from "../database/database.service.js";
import { AuthGuard } from "./auth.guard.js";
import { AUTH_INSTANCE } from "./auth.tokens.js";
import { createAuth } from "./create-auth.js";

@Global()
@Module({
  providers: [
    {
      provide: AUTH_INSTANCE,
      inject: [DatabaseService, ConfigService],
      useFactory: (database: DatabaseService, config: ConfigService) =>
        createAuth({
          db: database.db,
          secret: config.getOrThrow<string>("BETTER_AUTH_SECRET"),
          baseURL: config.getOrThrow<string>("BETTER_AUTH_URL"),
          webOrigin: config.getOrThrow<string>("WEB_ORIGIN"),
        }),
    },
    AuthGuard,
    { provide: APP_GUARD, useExisting: AuthGuard },
  ],
  exports: [AUTH_INSTANCE, AuthGuard],
})
export class AuthModule {}
