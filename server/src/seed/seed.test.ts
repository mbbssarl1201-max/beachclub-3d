import { test, expect } from "vitest";
import { CLUB } from "./club";
import { MENU } from "./menu";

test("club daybed ids are unique and positioned", () => {
  const ids = new Set(CLUB.map((d) => d.id));
  expect(ids.size).toBe(CLUB.length);
  expect(CLUB.every((d) => Number.isFinite(d.x) && Number.isFinite(d.z))).toBe(true);
  expect(CLUB.length).toBeGreaterThanOrEqual(12);
});

test("menu has cocktails and food with positive prices", () => {
  expect(MENU.some((m) => m.category === "cocktail")).toBe(true);
  expect(MENU.some((m) => m.category === "food")).toBe(true);
  expect(MENU.every((m) => m.priceChf > 0)).toBe(true);
  const ids = new Set(MENU.map((m) => m.id));
  expect(ids.size).toBe(MENU.length);
});
