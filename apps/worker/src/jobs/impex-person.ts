import { DatabaseService, ObjectStorageService, person } from "@helloworld/modules";
import { CreatePersonSchema } from "@helloworld/types/api";
import { eq } from "drizzle-orm";
import { z } from "zod";

export type PersonImpexResult = {
  rowsTotal: number;
  rowsError: number;
  errorSummary: string | null;
  objectKey: string | null;
};

const personArraySchema = z.array(z.unknown());

export async function importPersonJson(
  storage: ObjectStorageService,
  database: DatabaseService,
  objectKey: string,
): Promise<PersonImpexResult> {
  const got = await storage.getObject(objectKey);
  if (got.isErr()) {
    throw new Error(`Failed to load import object: ${got.error.message}`);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(got.value.body.toString("utf8"));
  } catch {
    throw new Error("Import payload is not valid JSON");
  }

  const rows = personArraySchema.parse(parsedJson);
  let rowsError = 0;
  const errorLines: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = CreatePersonSchema.safeParse(rows[i]);
    if (!parsed.success) {
      rowsError += 1;
      errorLines.push(`row ${i}: ${parsed.error.message}`);
      continue;
    }
    try {
      const existing = await database.db
        .select()
        .from(person)
        .where(eq(person.email, parsed.data.email))
        .limit(1);
      if (existing[0]) {
        await database.db
          .update(person)
          .set({ display_name: parsed.data.display_name })
          .where(eq(person.email, parsed.data.email));
      } else {
        await database.db.insert(person).values({
          display_name: parsed.data.display_name,
          email: parsed.data.email,
        });
      }
    } catch (err) {
      rowsError += 1;
      errorLines.push(`row ${i}: ${err instanceof Error ? err.message : "db error"}`);
    }
  }

  return {
    rowsTotal: rows.length,
    rowsError,
    errorSummary: rowsError > 0 ? errorLines.slice(0, 20).join("; ") : null,
    objectKey,
  };
}

export async function exportPersonJson(
  storage: ObjectStorageService,
  database: DatabaseService,
  runId: string,
): Promise<PersonImpexResult> {
  const rows = await database.db.select().from(person);
  const payload = rows.map((row) => ({
    id: row.id,
    display_name: row.display_name,
    email: row.email,
    created_at: row.created_at.toISOString(),
  }));
  const objectKey = `impex/exports/person/${runId}.json`;
  const put = await storage.putObject({
    key: objectKey,
    body: Buffer.from(JSON.stringify(payload, null, 2), "utf8"),
    contentType: "application/json",
  });
  if (put.isErr()) {
    throw new Error(`Failed to write export object: ${put.error.message}`);
  }
  return {
    rowsTotal: rows.length,
    rowsError: 0,
    errorSummary: null,
    objectKey,
  };
}
