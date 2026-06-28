import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CLUB } from "../seed/club";
import { MENU } from "../seed/menu";
import {
  createReservation,
  listReservedDaybedIds,
  DaybedTakenError,
  UnknownDaybedError,
} from "../domain/reservations";
import { createOrder, listOrders, EmptyCartError } from "../domain/orders";
import type { WsEvent, CartLine } from "@beachclub/shared/types";

const reservationBody = z.object({ daybedId: z.string(), name: z.string().min(1) });
const cartLine = z.object({
  itemId: z.string(),
  name: z.string(),
  qty: z.number().int().positive(),
  priceChf: z.number(),
});
const orderBody = z.object({ daybedId: z.string(), lines: z.array(cartLine) });

export interface ApiDeps {
  onEvent: (event: WsEvent) => void;
}

export function registerApi(app: FastifyInstance, deps: ApiDeps) {
  app.get("/api/layout", async () => CLUB);
  app.get("/api/menu", async () => MENU);
  app.get("/api/reservations", async () => listReservedDaybedIds());
  app.get("/api/orders", async () => listOrders());

  app.post("/api/reservations", async (req, reply) => {
    const parsed = reservationBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid body" });
    try {
      const r = await createReservation(parsed.data.daybedId, parsed.data.name);
      deps.onEvent({ type: "reservation", daybedId: r.daybedId });
      return reply.code(201).send(r);
    } catch (e) {
      if (e instanceof DaybedTakenError) return reply.code(409).send({ error: e.message });
      if (e instanceof UnknownDaybedError) return reply.code(404).send({ error: e.message });
      throw e;
    }
  });

  app.post("/api/orders", async (req, reply) => {
    const parsed = orderBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid body" });
    try {
      const order = await createOrder(parsed.data.daybedId, parsed.data.lines as CartLine[]);
      deps.onEvent({ type: "order", order });
      return reply.code(201).send(order);
    } catch (e) {
      if (e instanceof EmptyCartError) return reply.code(400).send({ error: e.message });
      throw e;
    }
  });
}
