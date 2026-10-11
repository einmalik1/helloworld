import { describe, expect, it, vi } from "vitest";

import { exportPersonJson, importPersonJson } from "./impex-person.js";

function ok<T>(value: T) {
  return {
    isErr: () => false as const,
    isOk: () => true as const,
    value,
  };
}

function err<E>(error: E) {
  return {
    isErr: () => true as const,
    isOk: () => false as const,
    error,
  };
}

describe("person JSON impex helpers", () => {
  it("imports rows upserting by email and counts validation errors", async () => {
    const store = new Map<string, { display_name: string; email: string }>();
    let selectCount = 0;

    const storage = {
      getObject: vi.fn(async () =>
        ok({
          key: "impex/uploads/a.json",
          body: Buffer.from(
            JSON.stringify([
              { display_name: "Ada", email: "ada@example.com" },
              { display_name: "Ada Lovelace", email: "ada@example.com" },
              { display_name: "Bad", email: 123 },
            ]),
          ),
          contentType: "application/json",
        }),
      ),
    };

    const database = {
      db: {
        select() {
          return {
            from() {
              return {
                where() {
                  return {
                    async limit() {
                      selectCount += 1;
                      if (selectCount === 1) {
                        return [];
                      }
                      const ada = store.get("ada@example.com");
                      return ada ? [ada] : [];
                    },
                  };
                },
              };
            },
          };
        },
        insert() {
          return {
            async values(row: { display_name: string; email: string }) {
              store.set(row.email, row);
            },
          };
        },
        update() {
          return {
            set(patch: { display_name: string }) {
              return {
                async where() {
                  const ada = store.get("ada@example.com");
                  if (ada) {
                    store.set(ada.email, { ...ada, ...patch });
                  }
                },
              };
            },
          };
        },
      },
    };

    const result = await importPersonJson(
      storage as never,
      database as never,
      "impex/uploads/a.json",
    );

    expect(result.rowsTotal).toBe(3);
    expect(result.rowsError).toBe(1);
    expect(store.get("ada@example.com")?.display_name).toBe("Ada Lovelace");
  });

  it("exports persons to object storage", async () => {
    const put = vi.fn(async () => ok(undefined));
    const storage = { putObject: put, getObject: vi.fn() };
    const database = {
      db: {
        select: () => ({
          from: async () => [
            {
              id: "11111111-1111-1111-1111-111111111111",
              display_name: "Ada",
              email: "ada@example.com",
              created_at: new Date("2026-01-01T00:00:00.000Z"),
            },
          ],
        }),
      },
    };

    const result = await exportPersonJson(
      storage as never,
      database as never,
      "22222222-2222-2222-2222-222222222222",
    );

    expect(result.rowsTotal).toBe(1);
    expect(result.rowsError).toBe(0);
    expect(result.objectKey).toContain("person/22222222");
    expect(put).toHaveBeenCalledOnce();
  });

  it("fails import when storage get fails", async () => {
    const storage = {
      getObject: vi.fn(async () => err({ message: "missing" })),
    };
    await expect(
      importPersonJson(storage as never, { db: {} } as never, "missing"),
    ).rejects.toThrow(/Failed to load import object/);
  });
});
