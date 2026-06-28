import { test, expect, beforeAll, beforeEach } from "vitest";
import { runAgentTurn } from "./brain";
import { MENU } from "../seed/menu";
import { db, migrate } from "../db/client";
import { orders } from "../db/schema";

beforeAll(async () => {
  await migrate();
});
beforeEach(async () => {
  await db.delete(orders);
});

// Fake Anthropic client: first call asks to add a mojito, second call ends the turn.
function fakeClient() {
  let call = 0;
  return {
    messages: {
      create: async () => {
        call += 1;
        if (call === 1) {
          return {
            stop_reason: "tool_use",
            content: [
              {
                type: "tool_use",
                id: "t1",
                name: "ajouter_article",
                input: { nom: "mojito", qty: 2 },
              },
            ],
          };
        }
        return { stop_reason: "end_turn", content: [{ type: "text", text: "C'est noté !" }] };
      },
    },
  } as any;
}

test("runAgentTurn executes tool calls and returns reply + updated cart", async () => {
  const res = await runAgentTurn(
    { daybedId: "bf1", message: "2 mojitos s'il te plaît", cart: [] },
    { client: fakeClient(), menu: MENU },
  );
  expect(res.cart[0]?.itemId).toBe("mojito");
  expect(res.cart[0]?.qty).toBe(2);
  expect(res.reply).toContain("noté");
});
