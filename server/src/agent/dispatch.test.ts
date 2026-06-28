import { test, expect, beforeAll, beforeEach } from "vitest";
import { dispatchTool, findMenuItem } from "./dispatch";
import { MENU } from "../seed/menu";
import { db, migrate } from "../db/client";
import { orders } from "../db/schema";

beforeAll(async () => {
  await migrate();
});
beforeEach(async () => {
  await db.delete(orders);
});

test("findMenuItem matches accented / partial names", () => {
  expect(findMenuItem(MENU, "mojito")?.id).toBe("mojito");
  expect(findMenuItem(MENU, "pina colada")?.id).toBe("pina");
  expect(findMenuItem(MENU, "ceviche")?.id).toBe("ceviche");
});

test("ajouter_article adds by fuzzy name", async () => {
  const r = await dispatchTool(
    "ajouter_article",
    { nom: "mojito", qty: 2 },
    { daybedId: "vo1", cart: [], menu: MENU },
  );
  expect(r.cart[0]?.qty).toBe(2);
});

test("unknown article returns introuvable, no cart change", async () => {
  const r = await dispatchTool(
    "ajouter_article",
    { nom: "licorne" },
    { daybedId: "vo1", cart: [], menu: MENU },
  );
  expect(r.result).toMatch(/introuvable/i);
  expect(r.cart).toEqual([]);
});

test("confirmer_commande on empty cart returns error result, no order", async () => {
  const r = await dispatchTool("confirmer_commande", {}, { daybedId: "vo1", cart: [], menu: MENU });
  expect(r.confirmed).toBeUndefined();
});

test("confirmer_commande with items creates an order and clears cart", async () => {
  const r = await dispatchTool(
    "confirmer_commande",
    {},
    { daybedId: "vo1", cart: [{ itemId: "mojito", name: "Mojito", qty: 1, priceChf: 18 }], menu: MENU },
  );
  expect(r.confirmed?.totalChf).toBe(18);
  expect(r.cart).toEqual([]);
});
