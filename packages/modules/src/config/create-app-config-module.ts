import { ConfigModule } from "@nestjs/config";
import { resolve } from "node:path";
import type { ZodType } from "zod";

export type CreateAppConfigModuleOptions<TSchema extends ZodType> = {
  envSchema: TSchema;
};

/**
 * Global Nest config module: validate process.env (+ optional root .env from cwd)
 * with the caller-supplied Zod schema. Does not load per-app .env files under apps/.
 */
export function createAppConfigModule<TSchema extends ZodType>({
  envSchema,
}: CreateAppConfigModuleOptions<TSchema>) {
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: resolve(process.cwd(), ".env"),
    validate: (env) => envSchema.parse(env) as Record<string, unknown>,
  });
}
