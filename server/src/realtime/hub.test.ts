import { test, expect } from "vitest";
import { createHub } from "./hub";

test("broadcast delivers JSON event to registered clients", () => {
  const hub = createHub();
  const received: string[] = [];
  hub.register({ send: (d) => received.push(d) });
  hub.broadcast({ type: "reservation", daybedId: "bf1" });
  expect(JSON.parse(received[0])).toEqual({ type: "reservation", daybedId: "bf1" });
});

test("unregister stops delivery", () => {
  const hub = createHub();
  const received: string[] = [];
  const off = hub.register({ send: (d) => received.push(d) });
  off();
  hub.broadcast({ type: "reservation", daybedId: "bf1" });
  expect(received).toHaveLength(0);
});
