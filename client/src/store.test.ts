import { test, expect, beforeEach } from "vitest";
import { useStore, linesTotal, promoDiscount } from "./store";
import type { MenuItem } from "@beachclub/shared/types";

const mojito: MenuItem = { id: "mojito", name: "Mojito", category: "cocktail", priceChf: 18 };

beforeEach(() => {
  useStore.setState({ reservedIds: new Set(), cart: [], orders: [], addons: [] });
});

test("applyWsEvent reservation adds to reservedIds", () => {
  useStore.getState().applyWsEvent({ type: "reservation", daybedId: "bf1" });
  expect(useStore.getState().reservedIds.has("bf1")).toBe(true);
});

test("applyWsEvent order prepends to orders", () => {
  const order = {
    id: "o1",
    daybedId: "bf1",
    lines: [],
    totalChf: 36,
    status: "new" as const,
    createdAt: "2026-06-28T10:00:00Z",
  };
  useStore.getState().applyWsEvent({ type: "order", order });
  expect(useStore.getState().orders[0]?.id).toBe("o1");
});

test("addLine merges quantity and linesTotal sums", () => {
  useStore.getState().addLine(mojito, 1);
  useStore.getState().addLine(mojito, 2);
  expect(useStore.getState().cart[0]?.qty).toBe(3);
  expect(linesTotal(useStore.getState().cart)).toBe(54);
});

test("addAddon and promoDiscount", () => {
  useStore.getState().addAddon({ id: "champagne", name: "Champagne", category: "bottle", priceChf: 200 }, 1);
  expect(linesTotal(useStore.getState().addons)).toBe(200);
  expect(promoDiscount("SUNSET", 200)).toBe(30);
  expect(promoDiscount("LAGUNE10", 200)).toBe(20);
  expect(promoDiscount(null, 200)).toBe(0);
});
