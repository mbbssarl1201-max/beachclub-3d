import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import Fastify, { type FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import { migrate } from "./db/client";
import { registerApi } from "./routes/api";
import { createHub, type Hub } from "./realtime/hub";
import { attachVoiceProxy } from "./voice/geminiProxy";

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

  attachVoiceProxy(app, hub);

  // Serve the built client (production) with SPA fallback.
  const clientDist = join(dirname(fileURLToPath(import.meta.url)), "../../client/dist");
  if (existsSync(clientDist)) {
    await app.register(fastifyStatic, { root: clientDist });
    app.setNotFoundHandler((req, reply) => {
      if (req.method === "GET" && !req.url.startsWith("/api") && !req.url.startsWith("/ws")) {
        return reply.sendFile("index.html");
      }
      return reply.code(404).send({ error: "not found" });
    });
  }

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
