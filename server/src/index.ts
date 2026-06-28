import Fastify, { type FastifyInstance } from "fastify";

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: false });
  app.get("/health", async () => ({ ok: true }));
  return app;
}

const isMain = process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js");
if (isMain && process.env.NODE_ENV !== "test") {
  const app = buildServer();
  app
    .listen({ port: Number(process.env.PORT ?? 3001), host: "0.0.0.0" })
    .then((addr) => console.log(`[beachclub] server on ${addr}`))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
