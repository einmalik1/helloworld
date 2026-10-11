import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "@helloworld/modules";
import {
  PostgresSearchSyncOutbox,
  RelationalGraphStore,
  SearchGraphProjectionSync,
  TypesenseSearchIndex,
  type TypesenseConfig,
} from "@helloworld/platform";

import type { AppConfig } from "../configuration.js";
import {
  GRAPH_STORE,
  PROJECTION_SYNC,
  SEARCH_INDEX,
  SEARCH_SYNC_OUTBOX,
} from "./search-graph.tokens.js";

function typesenseConfig(config: ConfigService<AppConfig, true>): TypesenseConfig {
  return {
    host: config.get("TYPESENSE_HOST", { infer: true }),
    port: config.get("TYPESENSE_PORT", { infer: true }),
    protocol: config.get("TYPESENSE_PROTOCOL", { infer: true }),
    apiKey: config.get("TYPESENSE_API_KEY", { infer: true }),
  };
}

export const searchGraphProviders = [
  {
    provide: SEARCH_INDEX,
    inject: [ConfigService],
    useFactory: (config: ConfigService<AppConfig, true>) =>
      new TypesenseSearchIndex(typesenseConfig(config)),
  },
  {
    provide: GRAPH_STORE,
    inject: [DatabaseService],
    useFactory: (database: DatabaseService) => new RelationalGraphStore(database.sql as never),
  },
  {
    provide: SEARCH_SYNC_OUTBOX,
    inject: [DatabaseService],
    useFactory: (database: DatabaseService) => new PostgresSearchSyncOutbox(database.sql as never),
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
];
