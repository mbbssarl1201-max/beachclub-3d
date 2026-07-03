import type { CartLine, MenuItem, Order } from "@beachclub/shared/types";
import { addItem, removeItem, cartTotal } from "../domain/cart";
import { createOrder, EmptyCartError } from "../domain/orders";
import { UnknownDaybedError } from "../domain/reservations";

export interface DispatchCtx {
  daybedId: string;
  cart: CartLine[];
  menu: MenuItem[];
}

export interface DispatchResult {
  cart: CartLine[];
  result: string;
  confirmed?: Order;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function findMenuItem(menu: MenuItem[], query: string): MenuItem | undefined {
  const q = normalize(query);
  return (
    menu.find((m) => m.id === q) ??
    menu.find((m) => normalize(m.name) === q) ??
    menu.find((m) => normalize(m.name).includes(q) || q.includes(m.id))
  );
}

export async function dispatchTool(
  name: string,
  input: Record<string, unknown>,
  ctx: DispatchCtx,
): Promise<DispatchResult> {
  switch (name) {
    case "ajouter_article": {
      const item = findMenuItem(ctx.menu, String(input.nom ?? ""));
      if (!item) return { cart: ctx.cart, result: `Article introuvable: ${input.nom}` };
      const qty = Number(input.qty ?? 1) || 1;
      const cart = addItem(ctx.cart, item, qty);
      return { cart, result: `Ajouté ${qty}× ${item.name}` };
    }
    case "retirer_article": {
      const item = findMenuItem(ctx.menu, String(input.nom ?? ""));
      if (!item) return { cart: ctx.cart, result: `Article introuvable: ${input.nom}` };
      const cart = removeItem(ctx.cart, item.id);
      return { cart, result: `Retiré ${item.name}` };
    }
    case "lire_panier": {
      if (ctx.cart.length === 0) return { cart: ctx.cart, result: "Le panier est vide." };
      const lines = ctx.cart.map((l) => `${l.qty}× ${l.name}`).join(", ");
      return { cart: ctx.cart, result: `Panier: ${lines}. Total ${cartTotal(ctx.cart)} CHF.` };
    }
    case "confirmer_commande": {
      try {
        const order = await createOrder(ctx.daybedId, ctx.cart);
        return { cart: [], result: `Commande confirmée, total ${order.totalChf} CHF.`, confirmed: order };
      } catch (e) {
        if (e instanceof EmptyCartError)
          return { cart: ctx.cart, result: "Impossible de confirmer: le panier est vide." };
        if (e instanceof UnknownDaybedError)
          return { cart: ctx.cart, result: "Impossible de confirmer: emplacement inconnu. Demandez au client de scanner le QR code de son daybed." };
        throw e;
      }
    }
    default:
      return { cart: ctx.cart, result: `Outil inconnu: ${name}` };
  }
}
