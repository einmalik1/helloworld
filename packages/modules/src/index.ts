// @helloworld/modules — Nest infrastructure + Drizzle schema entrypoints

export * from "./database/schema/index.js";
export * from "./database/auth-schema.js";
export * as databaseSchema from "./database/schema-entry.js";

export { createAppConfigModule } from "./config/create-app-config-module.js";
export type { CreateAppConfigModuleOptions } from "./config/create-app-config-module.js";

export { DatabaseModule } from "./database/database.module.js";
export { DatabaseService } from "./database/database.service.js";
export type { AppDatabase } from "./database/database.service.js";

export { HealthModule } from "./health/health.module.js";

export { AuthModule } from "./auth/auth.module.js";
export { AuthGuard } from "./auth/auth.guard.js";
export { AUTH_INSTANCE } from "./auth/auth.tokens.js";
export { Public, IS_PUBLIC_KEY } from "./auth/public.decorator.js";
export { createAuth } from "./auth/create-auth.js";
export type { AuthInstance, CreateAuthOptions } from "./auth/create-auth.js";
export { mountBetterAuth } from "./auth/mount-better-auth.js";

export { setupOpenApi } from "./openapi/setup-open-api.js";
export type { SetupOpenApiOptions } from "./openapi/setup-open-api.js";

export { createLoggerModule } from "./logging/create-logger-module.js";
