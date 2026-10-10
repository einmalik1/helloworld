import type { AppDatabase } from "@helloworld/modules";
import { NotFound } from "@helloworld/types";
import { describe, expect, it, vi } from "vitest";

import { getGreeting, listGreetings } from "./greeting.use-cases.js";
import { mapGreetingDbError } from "./map-db-error.js";

describe("mapGreetingDbError", () => {
  it("maps foreign key violations to NotFound", () => {
    const mapped = mapGreetingDbError({ code: "23503", message: "fk" });
    expect(mapped).toBeInstanceOf(NotFound);
    expect(mapped.message).toMatch(/author or channel/i);
  });
});

describe("getGreeting", () => {
  it("returns NotFound when no row matches", async () => {
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [],
          }),
        }),
      }),
    } as unknown as AppDatabase;

    const result = await getGreeting(db, "00000000-0000-4000-8000-000000000001");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(NotFound);
    }
  });
});

describe("listGreetings", () => {
  it("applies channel_id filter and pagination envelope", async () => {
    const channelId = "00000000-0000-4000-8000-0000000000aa";
    const whereSpy = vi.fn(() => ({
      orderBy: () => ({
        limit: () => ({
          offset: async () => [
            {
              id: "00000000-0000-4000-8000-0000000000bb",
              author_id: "00000000-0000-4000-8000-0000000000cc",
              channel_id: channelId,
              message: "hello",
              created_at: new Date("2026-01-01T00:00:00.000Z"),
            },
          ],
        }),
      }),
    }));
    const countWhereSpy = vi.fn(async () => [{ value: 1 }]);

    let selectCall = 0;
    const db = {
      select: () => {
        selectCall += 1;
        if (selectCall === 1) {
          return {
            from: () => ({
              where: countWhereSpy,
            }),
          };
        }
        return {
          from: () => ({
            where: whereSpy,
          }),
        };
      },
    } as unknown as AppDatabase;

    const result = await listGreetings(db, { channel_id: channelId, page: 2, limit: 10 });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toMatchObject({
        total: 1,
        page: 2,
        limit: 10,
      });
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0]?.channel_id).toBe(channelId);
    }
    expect(countWhereSpy).toHaveBeenCalled();
    expect(whereSpy).toHaveBeenCalled();
  });
});
