import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "@helloworld/modules";
import {
  PostgresSearchSyncOutbox,
  SearchGraphProjectionSync,
  TypesenseSearchIndex,
  type TypesenseConfig,
} from "@helloworld/platform";

import type { WorkerConfig } from "../configuration.js";
import { ProjectionService } from "./projection.service.js";
import { PROJECTION_SYNC, SEARCH_INDEX, SEARCH_SYNC_OUTBOX } from "./projection.tokens.js";

function typesenseConfig(config: ConfigService<WorkerConfig, true>): TypesenseConfig {
  return {
    host: config.get("TYPESENSE_HOST", { infer: true }),
    port: config.get("TYPESENSE_PORT", { infer: true }),
    protocol: config.get("TYPESENSE_PROTOCOL", { infer: true }),
    apiKey: config.get("TYPESENSE_API_KEY", { infer: true }),
  };
}

@Module({
  providers: [
    {
      provide: SEARCH_INDEX,
      inject: [ConfigService],
      useFactory: (config: ConfigService<WorkerConfig, true>) =>
        new TypesenseSearchIndex(typesenseConfig(config)),
    },
    {
      provide: SEARCH_SYNC_OUTBOX,
      inject: [DatabaseService],
      useFactory: (database: DatabaseService) =>
        new PostgresSearchSyncOutbox(database.sql as never),
    },
    {
      provide: PROJECTION_SYNC,
      inject: [DatabaseService, SEARCH_INDEX, SEARCH_SYNC_OUTBOX],
      useFactory: (
        database: DatabaseService,
        search: TypesenseSearchIndex,
        outbox: PostgresSearchSyncOutbox,
      ) => new SearchGraphProjectionSync(database.sql as never, search, outbox),
    },
    ProjectionService,
  ],
  exports: [ProjectionService, PROJECTION_SYNC],
})
export class ProjectionModule {}
