import { test, expect, beforeEach } from "vitest";
import { buildServer } from "../index";
import { db, migrate } from "../db/client";
import { reservations, orders } from "../db/schema";

beforeEach(async () => {
  await migrate();
  await db.delete(reservations);
  await db.delete(orders);
});

test("GET /api/menu returns a non-empty array", async () => {
  const { app } = await buildServer();
  const res = await app.inject({ method: "GET", url: "/api/menu" });
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.json())).toBe(true);
  expect(res.json().length).toBeGreaterThan(0);
});

test("double reservation of same daybed returns 409", async () => {
  const { app } = await buildServer();
  const first = await app.inject({
    method: "POST",
    url: "/api/reservations",
    payload: { daybedId: "bf2", name: "A" },
  });
  expect(first.statusCode).toBe(201);
  const second = await app.inject({
    method: "POST",
    url: "/api/reservations",
    payload: { daybedId: "bf2", name: "B" },
  });
  expect(second.statusCode).toBe(409);
});

test("order with empty cart returns 400", async () => {
  const { app } = await buildServer();
  const res = await app.inject({
    method: "POST",
    url: "/api/orders",
    payload: { daybedId: "bf2", lines: [] },
  });
  expect(res.statusCode).toBe(400);
});

test("valid order returns 201 with computed total", async () => {
  const { app } = await buildServer();
  const res = await app.inject({
    method: "POST",
    url: "/api/orders",
    payload: { daybedId: "bf2", lines: [{ itemId: "mojito", name: "Mojito", qty: 2, priceChf: 18 }] },
  });
  expect(res.statusCode).toBe(201);
  expect(res.json().totalChf).toBe(36);
});
