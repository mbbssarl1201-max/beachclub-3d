import type { FastifyInstance } from "fastify";
import { runAgentTurn as defaultRunAgentTurn } from "../agent/brain";
import type { Hub } from "../realtime/hub";
import type { CartLine, Order } from "@beachclub/shared/types";

const GEMINI_MODEL = process.env.GEMINI_LIVE_MODEL ?? "gemini-live-2.5-flash-native-audio";

// The single function Gemini Live is allowed to call. Reasoning is delegated to Claude.
export const VOICE_FUNCTION = {
  name: "passer_commande",
  description:
    "Transmets la demande de commande du client (en texte) au système. À appeler dès que le client veut ajouter, retirer ou confirmer des articles.",
  parameters: {
    type: "object",
    properties: {
      texte: { type: "string", description: "La demande du client, mot pour mot." },
    },
    required: ["texte"],
  },
};

export interface VoiceCtx {
  daybedId: string;
  cart: CartLine[];
}

export interface VoiceCallResult {
  functionResponse: { name: string; response: { reply: string } };
  cart: CartLine[];
  order?: Order;
}

type RunAgentTurn = typeof defaultRunAgentTurn;

/**
 * Routes a Gemini Live function call to the Claude brain. Unit-tested in isolation;
 * the audio socket plumbing in attachVoiceProxy is verified manually.
 */
export async function handleGeminiFunctionCall(
  call: { name: string; args?: Record<string, unknown> },
  ctx: VoiceCtx,
  deps: { runAgentTurn: RunAgentTurn },
): Promise<VoiceCallResult> {
  if (call.name !== "passer_commande") {
    return {
      functionResponse: { name: call.name, response: { reply: "Fonction inconnue." } },
      cart: ctx.cart,
    };
  }
  const texte = String(call.args?.texte ?? "");
  const turn = await deps.runAgentTurn({ daybedId: ctx.daybedId, message: texte, cart: ctx.cart });
  return {
    functionResponse: { name: call.name, response: { reply: turn.reply } },
    cart: turn.cart,
    order: turn.order,
  };
}

/**
 * Bridges a browser WebSocket to a Gemini Live native-audio session.
 * Browser → /ws/voice → backend → Gemini. On a passer_commande function call,
 * the order decision is delegated to Claude (handleGeminiFunctionCall), the spoken
 * reply is sent back to Gemini, the updated cart is pushed to the browser, and a
 * confirmed order is broadcast to the KDS via the hub.
 */
export function attachVoiceProxy(app: FastifyInstance, hub: Hub): void {
  app.register(async (scoped) => {
    scoped.get("/ws/voice", { websocket: true }, async (socket, req) => {
      const apiKey = process.env.GEMINI_API_KEY;
      const daybedId = (req.query as { daybed?: string })?.daybed ?? "inconnu";
      if (!apiKey) {
        socket.send(JSON.stringify({ type: "error", message: "voix indisponible (GEMINI_API_KEY manquante)" }));
        socket.close();
        return;
      }

      let cart: CartLine[] = [];
      let session: any;

      try {
        const { GoogleGenAI, Modality } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        session = await ai.live.connect({
          model: GEMINI_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction:
              `Tu es le serveur vocal du beach club Lagune, daybed ${daybedId}. ` +
              "Sois chaleureux et bref. Pour toute demande d'articles, appelle passer_commande avec le texte du client.",
            tools: [{ functionDeclarations: [VOICE_FUNCTION as any] }],
          },
          callbacks: {
            onopen: () => {},
            onmessage: async (msg: any) => {
              // Forward Gemini audio to the browser.
              const audio = msg.data ?? msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio) socket.send(JSON.stringify({ type: "audio", data: audio }));

              // Handle function calls by delegating to Claude.
              const calls = msg.toolCall?.functionCalls ?? [];
              for (const call of calls) {
                const out = await handleGeminiFunctionCall(
                  { name: call.name, args: call.args },
                  { daybedId, cart },
                  { runAgentTurn: defaultRunAgentTurn },
                );
                cart = out.cart;
                socket.send(JSON.stringify({ type: "cart", cart }));
                if (out.order) {
                  hub.broadcast({ type: "order", order: out.order });
                  socket.send(JSON.stringify({ type: "order", order: out.order }));
                }
                session?.sendToolResponse({
                  functionResponses: [
                    { id: call.id, name: call.name, response: out.functionResponse.response },
                  ],
                });
              }
            },
            onerror: (e: any) => socket.send(JSON.stringify({ type: "error", message: String(e?.message ?? e) })),
            onclose: () => socket.close(),
          },
        });
      } catch (e) {
        socket.send(JSON.stringify({ type: "error", message: "connexion voix échouée" }));
        socket.close();
        return;
      }

      // Browser audio frames → Gemini.
      socket.on("message", (raw) => {
        try {
          const frame = JSON.parse(raw.toString());
          if (frame.type === "audio" && frame.data) {
            session?.sendRealtimeInput({
              audio: { data: frame.data, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch {
          /* ignore malformed frames */
        }
      });
      socket.on("close", () => session?.close());
    });
  });
}
