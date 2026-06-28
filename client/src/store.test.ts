import { test, expect, beforeEach } from "vitest";
import { useStore, cartTotal } from "./store";
import type { MenuItem } from "@beachclub/shared/types";

const mojito: MenuItem = { id: "mojito", name: "Mojito", category: "cocktail", priceChf: 18 };

beforeEach(() => {
  useStore.setState({ reservedIds: new Set(), cart: [], orders: [] });
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

test("addLine merges quantity and cartTotal sums", () => {
  useStore.getState().addLine(mojito, 1);
  useStore.getState().addLine(mojito, 2);
  expect(useStore.getState().cart[0]?.qty).toBe(3);
  expect(cartTotal(useStore.getState().cart)).toBe(54);
});
