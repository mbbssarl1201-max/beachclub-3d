import { test, expect, beforeAll, beforeEach } from "vitest";
import { db, migrate } from "../db/client";
import { orders } from "../db/schema";
import { createOrder, listOrders, EmptyCartError } from "./orders";
import { UnknownDaybedError } from "./reservations";

beforeAll(async () => {
  await migrate();
});
beforeEach(async () => {
  await db.delete(orders);
});

test("empty cart rejected", async () => {
  await expect(createOrder("vo1", [])).rejects.toBeInstanceOf(EmptyCartError);
});

test("unknown daybed rejected", async () => {
  await expect(
    createOrder("ps3", [{ itemId: "mojito", name: "Mojito", qty: 1, priceChf: 18 }]),
  ).rejects.toBeInstanceOf(UnknownDaybedError);
});

test("order total computed and persisted with status new", async () => {
  const o = await createOrder("vo1", [
    { itemId: "mojito", name: "Mojito", qty: 2, priceChf: 18 },
  ]);
  expect(o.totalChf).toBe(36);
  expect(o.status).toBe("new");
  expect((await listOrders()).length).toBe(1);
});
