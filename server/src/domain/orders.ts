import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { orders } from "../db/schema";
import { cartTotal } from "./cart";
import { CLUB } from "../seed/club";
import { UnknownDaybedError } from "./reservations";
import type { CartLine, Order } from "@beachclub/shared/types";

export class EmptyCartError extends Error {
  constructor() {
    super("Le panier est vide");
    this.name = "EmptyCartError";
  }
}

export async function createOrder(daybedId: string, lines: CartLine[]): Promise<Order> {
  if (lines.length === 0) throw new EmptyCartError();
  if (!CLUB.some((d) => d.id === daybedId)) throw new UnknownDaybedError(daybedId);
  const row = {
    id: crypto.randomUUID(),
    daybedId,
    lines,
    totalChf: cartTotal(lines),
    status: "new" as const,
  };
  await db.insert(orders).values(row);
  const [saved] = await db.select().from(orders).where(eq(orders.id, row.id));
  return {
    id: saved.id,
    daybedId: saved.daybedId,
    lines: saved.lines as CartLine[],
    totalChf: saved.totalChf,
    status: saved.status as Order["status"],
    createdAt: saved.createdAt.toISOString(),
  };
}

export async function listOrders(): Promise<Order[]> {
  const rows = await db.select().from(orders);
  return rows
    .map((r) => ({
      id: r.id,
      daybedId: r.daybedId,
      lines: r.lines as CartLine[],
      totalChf: r.totalChf,
      status: r.status as Order["status"],
      createdAt: r.createdAt.toISOString(),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
