import type { WsEvent } from "@beachclub/shared/types";

export interface Sender {
  send(data: string): void;
}

export interface Hub {
  register(socket: Sender): () => void;
  broadcast(event: WsEvent): void;
  size(): number;
}

export function createHub(): Hub {
  const clients = new Set<Sender>();
  return {
    register(socket) {
      clients.add(socket);
      return () => clients.delete(socket);
    },
    broadcast(event) {
      const payload = JSON.stringify(event);
      for (const c of clients) {
        try {
          c.send(payload);
        } catch {
          clients.delete(c);
        }
      }
    },
    size: () => clients.size,
  };
}
