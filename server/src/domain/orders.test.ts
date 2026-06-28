import { test, expect, beforeAll, beforeEach } from "vitest";
import { db, migrate } from "../db/client";
import { orders } from "../db/schema";
import { createOrder, listOrders, EmptyCartError } from "./orders";

beforeAll(async () => {
  await migrate();
});
beforeEach(async () => {
  await db.delete(orders);
});

test("empty cart rejected", async () => {
  await expect(createOrder("bf1", [])).rejects.toBeInstanceOf(EmptyCartError);
});

test("order total computed and persisted with status new", async () => {
  const o = await createOrder("bf1", [
    { itemId: "mojito", name: "Mojito", qty: 2, priceChf: 18 },
  ]);
  expect(o.totalChf).toBe(36);
  expect(o.status).toBe("new");
  expect((await listOrders()).length).toBe(1);
});
