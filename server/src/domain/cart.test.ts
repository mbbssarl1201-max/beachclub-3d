import { test, expect } from "vitest";
import { addItem, removeItem, cartTotal } from "./cart";
import type { MenuItem } from "@beachclub/shared/types";

const mojito: MenuItem = { id: "mojito", name: "Mojito", category: "cocktail", priceChf: 18 };

test("adding same item twice increments qty", () => {
  let c = addItem([], mojito, 1);
  c = addItem(c, mojito, 2);
  expect(c).toEqual([{ itemId: "mojito", name: "Mojito", qty: 3, priceChf: 18 }]);
});

test("removeItem drops the line", () => {
  const c = addItem([], mojito, 1);
  expect(removeItem(c, "mojito")).toEqual([]);
});

test("cartTotal sums qty*price", () => {
  expect(cartTotal(addItem([], mojito, 2))).toBe(36);
});
