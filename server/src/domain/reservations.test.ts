import { test, expect, beforeAll, beforeEach } from "vitest";
import { db, migrate } from "../db/client";
import { reservations } from "../db/schema";
import {
  createReservation,
  listReservedDaybedIds,
  DaybedTakenError,
  UnknownDaybedError,
} from "./reservations";

beforeAll(async () => {
  await migrate();
});
beforeEach(async () => {
  await db.delete(reservations);
});

test("second reservation of same daybed throws DaybedTakenError", async () => {
  await createReservation("bf1", "A");
  await expect(createReservation("bf1", "B")).rejects.toBeInstanceOf(DaybedTakenError);
});

test("unknown daybed rejected", async () => {
  await expect(createReservation("nope", "A")).rejects.toBeInstanceOf(UnknownDaybedError);
});

test("listReservedDaybedIds returns reserved ids", async () => {
  await createReservation("bf1", "A");
  await createReservation("cb1", "B");
  expect((await listReservedDaybedIds()).sort()).toEqual(["bf1", "cb1"]);
});
