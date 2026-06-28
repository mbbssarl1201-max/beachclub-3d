import { useStore } from "./store";
import type { WsEvent } from "@beachclub/shared/types";

export function connectWs(): () => void {
  let closed = false;
  let ws: WebSocket;

  const open = () => {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    ws = new WebSocket(`${proto}://${location.host}/ws`);
    ws.onmessage = (ev) => {
      try {
        useStore.getState().applyWsEvent(JSON.parse(ev.data) as WsEvent);
      } catch {
        /* ignore */
      }
    };
    ws.onclose = () => {
      if (!closed) setTimeout(open, 1500);
    };
  };

  open();
  return () => {
    closed = true;
    ws?.close();
  };
}

export async function fetchInitial(): Promise<void> {
  const [reserved, orders] = await Promise.all([
    fetch("/api/reservations").then((r) => r.json()),
    fetch("/api/orders").then((r) => r.json()),
  ]);
  useStore.getState().setReserved(reserved);
  useStore.getState().setOrders(orders);
}
