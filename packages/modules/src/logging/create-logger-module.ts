import { randomUUID } from "node:crypto";
import { LoggerModule } from "nestjs-pino";

/**
 * Shared nestjs-pino defaults — matches `apps/api` README normative LoggerModule config.
 */
export function createLoggerModule() {
  return LoggerModule.forRoot({
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? "info",
      autoLogging: false,
      genReqId: (req) =>
        (req.headers["x-request-id"] as string | undefined) ?? randomUUID(),
      customProps: (req) => ({ requestId: req.id }),
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { singleLine: true } }
          : undefined,
    },
  });
}
