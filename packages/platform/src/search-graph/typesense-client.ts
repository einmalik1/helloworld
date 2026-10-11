import type { EntityType, SearchHit, SearchResult } from "./types.js";
import type { SearchIndex, SearchQuery } from "./ports.js";

export type TypesenseConfig = {
  host: string;
  port: number;
  protocol: "http" | "https";
  apiKey: string;
  collection?: string;
};

const COLLECTION = "helloworld";

export class TypesenseSearchIndex implements SearchIndex {
  private readonly baseUrl: string;
  private readonly collection: string;

  constructor(private readonly config: TypesenseConfig) {
    this.baseUrl = `${config.protocol}://${config.host}:${config.port}`;
    this.collection = config.collection ?? COLLECTION;
  }

  async ping(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/health`, {
      headers: { "X-TYPESENSE-API-KEY": this.config.apiKey },
    });
    if (!res.ok) {
      throw new Error(`Typesense health HTTP ${res.status}`);
    }
  }

  async ensureCollection(): Promise<void> {
    const get = await fetch(`${this.baseUrl}/collections/${this.collection}`, {
      headers: { "X-TYPESENSE-API-KEY": this.config.apiKey },
    });
    if (get.ok) return;
    if (get.status !== 404) {
      throw new Error(`Typesense get collection HTTP ${get.status}`);
    }
    const create = await fetch(`${this.baseUrl}/collections`, {
      method: "POST",
      headers: {
        "X-TYPESENSE-API-KEY": this.config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.collection,
        fields: [
          { name: "id", type: "string" },
          { name: "type", type: "string", facet: true },
          { name: "title", type: "string" },
          { name: "body", type: "string", optional: true },
          { name: "refId", type: "string" },
          { name: "updatedAt", type: "string" },
        ],
      }),
    });
    if (!create.ok) {
      const text = await create.text();
      throw new Error(`Typesense create collection HTTP ${create.status}: ${text}`);
    }
  }

  async upsertDocument(doc: {
    id: string;
    type: EntityType;
    title: string;
    body?: string;
    refId: string;
    updatedAt: string;
  }): Promise<void> {
    await this.ensureCollection();
    const res = await fetch(
      `${this.baseUrl}/collections/${this.collection}/documents?action=upsert`,
      {
        method: "POST",
        headers: {
          "X-TYPESENSE-API-KEY": this.config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doc),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Typesense upsert HTTP ${res.status}: ${text}`);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/collections/${this.collection}/documents/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { "X-TYPESENSE-API-KEY": this.config.apiKey },
      },
    );
    if (!res.ok && res.status !== 404) {
      const text = await res.text();
      throw new Error(`Typesense delete HTTP ${res.status}: ${text}`);
    }
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    await this.ensureCollection();
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const params = new URLSearchParams({
      q: query.q || "*",
      query_by: "title,body",
      per_page: String(limit),
    });
    if (query.types?.length) {
      params.set("filter_by", `type:=[${query.types.join(",")}]`);
    }
    const res = await fetch(
      `${this.baseUrl}/collections/${this.collection}/documents/search?${params}`,
      { headers: { "X-TYPESENSE-API-KEY": this.config.apiKey } },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Typesense search HTTP ${res.status}: ${text}`);
    }
    const body = (await res.json()) as {
      found?: number;
      hits?: Array<{
        document?: {
          id?: string;
          type?: EntityType;
          title?: string;
          body?: string;
        };
        text_match?: number;
      }>;
    };
    const items: SearchHit[] = (body.hits ?? []).flatMap((hit) => {
      const doc = hit.document;
      if (!doc?.id || !doc.type || !doc.title) return [];
      return [
        {
          id: doc.id,
          type: doc.type,
          title: doc.title,
          body: doc.body,
          score: hit.text_match,
        },
      ];
    });
    return { items, total: body.found ?? items.length };
  }
}
