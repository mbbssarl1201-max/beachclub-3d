import Fastify, { type FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";
import { migrate } from "./db/client";
import { registerApi } from "./routes/api";
import { createHub, type Hub } from "./realtime/hub";

export async function buildServer(): Promise<{ app: FastifyInstance; hub: Hub }> {
  const app = Fastify({ logger: false });
  const hub = createHub();

  await migrate();
  await app.register(websocket);

  app.get("/health", async () => ({ ok: true }));
  registerApi(app, { onEvent: hub.broadcast });

  app.register(async (scoped) => {
    scoped.get("/ws", { websocket: true }, (socket) => {
      const off = hub.register({ send: (d) => socket.send(d) });
      socket.on("close", off);
    });
  });

  return { app, hub };
}

const isMain =
  process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js");
if (isMain && process.env.NODE_ENV !== "test") {
  buildServer()
    .then(({ app }) =>
      app.listen({ port: Number(process.env.PORT ?? 3001), host: "0.0.0.0" }),
    )
    .then((addr) => console.log(`[beachclub] server on ${addr}`))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
