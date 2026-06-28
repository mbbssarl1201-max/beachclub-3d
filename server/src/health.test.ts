import { test, expect } from "vitest";
import { buildServer } from "./index";

test("health returns ok", async () => {
  const { app } = await buildServer();
  const res = await app.inject({ method: "GET", url: "/health" });
  expect(res.statusCode).toBe(200);
  expect(res.json()).toEqual({ ok: true });
});
