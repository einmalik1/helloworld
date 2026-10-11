import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HealthIndicatorService } from "@nestjs/terminus";
import type { HealthIndicatorResult } from "@nestjs/terminus";

@Injectable()
export class TypesenseHealthIndicator {
  constructor(
    private readonly config: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key = "typesense"): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    const host = this.config.get<string>("TYPESENSE_HOST");
    const apiKey = this.config.get<string>("TYPESENSE_API_KEY");
    if (!host || !apiKey) {
      return indicator.up({ skipped: true });
    }

    const port = this.config.get<number>("TYPESENSE_PORT") ?? 8108;
    const protocol = this.config.get<string>("TYPESENSE_PROTOCOL") ?? "http";
    const url = `${protocol}://${host}:${port}/health`;

    try {
      const res = await fetch(url, {
        headers: { "X-TYPESENSE-API-KEY": apiKey },
      });
      if (!res.ok) {
        return indicator.down({ message: `Typesense HTTP ${res.status}` });
      }
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : "typesense unreachable",
      });
    }
  }
}
