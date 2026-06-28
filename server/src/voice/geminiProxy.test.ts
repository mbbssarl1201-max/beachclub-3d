import { test, expect } from "vitest";
import { handleGeminiFunctionCall } from "./geminiProxy";
import type { CartLine } from "@beachclub/shared/types";

test("passer_commande delegates to Claude brain and returns reply + cart", async () => {
  const fakeRun = (async (args: { cart: CartLine[] }) => ({
    reply: "Deux mojitos, c'est noté !",
    cart: [{ itemId: "mojito", name: "Mojito", qty: 2, priceChf: 18 }],
    history: [],
  })) as any;

  const out = await handleGeminiFunctionCall(
    { name: "passer_commande", args: { texte: "deux mojitos" } },
    { daybedId: "vo1", cart: [] },
    { runAgentTurn: fakeRun },
  );

  expect(out.functionResponse.response.reply).toContain("noté");
  expect(out.cart[0]?.itemId).toBe("mojito");
});

test("unknown function returns a safe response without calling the brain", async () => {
  let called = false;
  const fakeRun = (async () => {
    called = true;
    return { reply: "", cart: [], history: [] };
  }) as any;

  const out = await handleGeminiFunctionCall(
    { name: "autre_chose", args: {} },
    { daybedId: "vo1", cart: [] },
    { runAgentTurn: fakeRun },
  );

  expect(called).toBe(false);
  expect(out.functionResponse.response.reply).toMatch(/inconnue/i);
});
