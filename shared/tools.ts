// Tool schemas shared between the Claude text brain and the Gemini voice channel.
// Anthropic tool-use format. Gemini uses a single delegating function (see voice proxy).

export const TOOLS = [
  {
    name: "ajouter_article",
    description: "Ajoute un article de la carte au panier du client.",
    input_schema: {
      type: "object" as const,
      properties: {
        nom: { type: "string", description: "Nom de l'article (ex: 'Mojito', 'Ceviche')." },
        qty: { type: "number", description: "Quantité, défaut 1." },
      },
      required: ["nom"],
    },
  },
  {
    name: "retirer_article",
    description: "Retire un article du panier.",
    input_schema: {
      type: "object" as const,
      properties: {
        nom: { type: "string", description: "Nom de l'article à retirer." },
      },
      required: ["nom"],
    },
  },
  {
    name: "lire_panier",
    description: "Lit le contenu actuel du panier et le total.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "confirmer_commande",
    description: "Confirme et envoie la commande en cuisine/bar. À n'appeler qu'après accord du client.",
    input_schema: { type: "object" as const, properties: {} },
  },
] as const;

export type ToolName = (typeof TOOLS)[number]["name"];
