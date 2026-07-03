import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { reservations } from "../db/schema";
import { CLUB } from "../seed/club";
import type { Reservation } from "@beachclub/shared/types";

export class DaybedTakenError extends Error {
  constructor(daybedId: string) {
    super(`Daybed ${daybedId} déjà réservé`);
    this.name = "DaybedTakenError";
  }
}

export class UnknownDaybedError extends Error {
  constructor(daybedId: string) {
    super(`Daybed ${daybedId} inconnu`);
    this.name = "UnknownDaybedError";
  }
}

export async function createReservation(daybedId: string, name: string): Promise<Reservation> {
  if (!CLUB.some((d) => d.id === daybedId)) throw new UnknownDaybedError(daybedId);
  const existing = await db
    .select()
    .from(reservations)
    .where(eq(reservations.daybedId, daybedId));
  if (existing.length > 0) throw new DaybedTakenError(daybedId);

  const row = { id: crypto.randomUUID(), daybedId, name };
  try {
    await db.insert(reservations).values(row);
  } catch (e) {
    // Unique index on daybed_id: a concurrent insert between check and insert
    // lands here instead of double-booking.
    if (e instanceof Error && /unique|duplicate/i.test(e.message)) throw new DaybedTakenError(daybedId);
    throw e;
  }
  const [saved] = await db.select().from(reservations).where(eq(reservations.id, row.id));
  return { ...saved, createdAt: saved.createdAt.toISOString() };
}

export async function listReservedDaybedIds(): Promise<string[]> {
  const rows = await db.select({ daybedId: reservations.daybedId }).from(reservations);
  return rows.map((r) => r.daybedId);
}
