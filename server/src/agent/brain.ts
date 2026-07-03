import Anthropic from "@anthropic-ai/sdk";
import { TOOLS } from "@beachclub/shared/tools";
import type { CartLine, MenuItem, Order } from "@beachclub/shared/types";
import { MENU } from "../seed/menu";
import { dispatchTool } from "./dispatch";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-4-8";

function systemPrompt(daybedId: string, menu: MenuItem[]): string {
  const carte = menu.map((m) => `- ${m.name} (${m.priceChf} CHF)`).join("\n");
  return [
    "Tu es le serveur IA du beach club « Lagune ». Le client est installé au daybed",
    `« ${daybedId} ». Tu prends sa commande de façon chaleureuse, concise et efficace.`,
    "Utilise les outils pour gérer le panier. Confirme TOUJOURS le récapitulatif et",
    "demande l'accord du client AVANT d'appeler confirmer_commande.",
    "Réponds en français, en une ou deux phrases.",
    "",
    "Carte du jour :",
    carte,
  ].join("\n");
}

export interface AgentTurnArgs {
  daybedId: string;
  message: string;
  history?: Anthropic.MessageParam[];
  cart: CartLine[];
}

export interface AgentTurnDeps {
  client?: Pick<Anthropic, "messages">;
  menu?: MenuItem[];
}

export interface AgentTurnResult {
  reply: string;
  cart: CartLine[];
  order?: Order;
  history: Anthropic.MessageParam[];
}

export async function runAgentTurn(
  args: AgentTurnArgs,
  deps: AgentTurnDeps = {},
): Promise<AgentTurnResult> {
  const client = deps.client ?? new Anthropic();
  const menu = deps.menu ?? MENU;
  let cart = args.cart;
  let order: Order | undefined;

  const messages: Anthropic.MessageParam[] = [
    ...(args.history ?? []),
    { role: "user", content: args.message },
  ];

  // Manual tool-use loop. Thinking explicitly disabled → low latency for live
  // ordering (on claude-sonnet-5, omitting `thinking` would run adaptive thinking).
  for (let guard = 0; guard < 6; guard++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system: systemPrompt(args.daybedId, menu),
      tools: TOOLS as unknown as Anthropic.Tool[],
      messages,
    });
    messages.push({ role: "assistant", content: res.content });

    if (res.stop_reason !== "tool_use") {
      const reply = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join(" ")
        .trim();
      return { reply, cart, order, history: messages };
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      const out = await dispatchTool(
        block.name,
        block.input as Record<string, unknown>,
        { daybedId: args.daybedId, cart, menu },
      );
      cart = out.cart;
      if (out.confirmed) order = out.confirmed;
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: out.result });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { reply: "Désolé, pouvez-vous reformuler votre commande ?", cart, order, history: messages };
}
