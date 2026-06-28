import { test, expect, beforeAll } from "vitest";
import { db, migrate } from "./client";
import { reservations } from "./schema";
import { eq } from "drizzle-orm";

beforeAll(async () => {
  await migrate();
});

test("can insert and read a reservation", async () => {
  await db.insert(reservations).values({ id: "r1", daybedId: "d1", name: "Test" });
  const rows = await db.select().from(reservations).where(eq(reservations.id, "r1"));
  expect(rows[0]?.name).toBe("Test");
});
