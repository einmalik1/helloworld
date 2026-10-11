import { describe, expect, it } from "vitest";

import { parseEntityType, parseEntityTypes } from "./use-cases.js";

describe("search-graph use-case helpers", () => {
  it("parses entity types", () => {
    expect(parseEntityType("greeting")).toBe("greeting");
    expect(parseEntityTypes("person,channel")).toEqual(["person", "channel"]);
  });

  it("rejects unknown entity types", () => {
    expect(() => parseEntityType("nope")).toThrow(/invalid entityType/);
  });
});
