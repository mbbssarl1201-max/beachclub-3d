# Build the client, then run the Fastify server (serves API + WS + built client).
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @beachclub/client build

FROM node:22-slim AS runtime
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
ENV PORT=3001
ENV PGLITE_DATA=/data
COPY --from=build /app ./
RUN mkdir -p /data
EXPOSE 3001
CMD ["pnpm", "--filter", "@beachclub/server", "exec", "tsx", "src/index.ts"]
