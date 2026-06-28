# Beach Club 3D — POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A pitchable web demo where a guest books a daybed on an interactive 3D club map, then orders by voice (Gemini Live) or text (Claude) from the daybed, with orders appearing live on a bar/kitchen screen.

**Architecture:** Single TypeScript monorepo — a Vite/React client (3D booking, ordering, KDS) and a Fastify server (REST + WebSocket hub + Claude agent brain + Gemini Live voice proxy). Club layout and menu are seeded JSON; reservations and orders live in Postgres via Drizzle. WebSocket broadcasts keep the three screens in sync. Claude is the single source of order reasoning; Gemini Live is only the spoken voice channel and delegates ordering decisions to Claude.

**Tech Stack:** Vite + React + TS, react-three-fiber + @react-three/drei, Framer Motion, Tailwind + shadcn/ui, zustand; Node + Fastify, Drizzle ORM + Postgres, `ws`; `@anthropic-ai/sdk`; Gemini Live (Google AI Studio / Vertex EU); Vitest + Playwright; Docker + Traefik (VPS 76.13.55.44).

## Global Constraints

- Project lives in `~/beachclub-3d`, **isolated** — no shared resources with the medical VPS or any PHI project.
- Secrets (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`) only in `.env` (gitignored). Never in versioned files.
- All data is **fictional** — no real Finns content, no real customer data.
- Do **not** push to `main`/`master` directly (hook `agent-guard` blocks). Work on a feature branch.
- Deploy target: VPS `76.13.55.44` behind Traefik, subdomain `beachclub.mbbssarl.ch`. NOT the medical VPS.
- Node 20+, TypeScript strict mode. Package manager: `pnpm`.
- Claude is the only order-reasoning brain. Gemini Live never decides the cart on its own — it calls `passer_commande(texte)` which routes to Claude.

---

## File Structure

```
beachclub-3d/
├── package.json                  # pnpm workspace root
├── pnpm-workspace.yaml
├── docker-compose.yml            # postgres for local dev
├── shared/
│   ├── types.ts                  # Daybed, MenuItem, Cart, Order, WS events
│   └── tools.ts                  # agent tool JSON schemas (shared voice/text)
├── server/
│   ├── src/
│   │   ├── index.ts              # Fastify bootstrap
│   │   ├── seed/club.ts          # club layout (daybeds + positions)
│   │   ├── seed/menu.ts          # menu items
│   │   ├── db/schema.ts          # Drizzle: reservations, orders
│   │   ├── db/client.ts          # Drizzle client
│   │   ├── domain/cart.ts        # pure cart logic
│   │   ├── domain/reservations.ts
│   │   ├── domain/orders.ts
│   │   ├── agent/brain.ts        # Claude tool-dispatch loop
│   │   ├── agent/dispatch.ts     # maps tool calls -> cart/order ops
│   │   ├── routes/api.ts         # REST routes
│   │   ├── realtime/hub.ts       # WebSocket broadcast hub
│   │   └── voice/geminiProxy.ts  # Gemini Live WS proxy
│   ├── drizzle.config.ts
│   └── vitest.config.ts
└── client/
    ├── index.html
    ├── vite.config.ts
    ├── src/
    │   ├── main.tsx / App.tsx / router
    │   ├── store.ts              # zustand
    │   ├── ws.ts                 # WS client
    │   ├── scenes/ClubScene.tsx  # r3f 3D booking
    │   ├── pages/Booking.tsx
    │   ├── pages/Daybed.tsx      # order: menu + chat + mic
    │   ├── pages/Kds.tsx
    │   └── components/...        # Cart, ChatPanel, MicButton, MenuGrid
    └── e2e/booking-to-kds.spec.ts
```

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `server/package.json`, `client/package.json`, `shared/package.json`, root `tsconfig.json`, `server/vitest.config.ts`, `docker-compose.yml`, `.env.example`
- Test: `server/src/health.test.ts`

**Interfaces:**
- Produces: a `pnpm dev` that runs the Fastify server on `:3001` and Vite on `:5173`; a Postgres container on `:5433`.

- [ ] **Step 1: Create workspace files**

`pnpm-workspace.yaml`:
```yaml
packages:
  - shared
  - server
  - client
```

Root `package.json`:
```json
{
  "name": "beachclub-3d",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "test": "pnpm -r test",
    "build": "pnpm -r build"
  }
}
```

`docker-compose.yml` (local dev DB only):
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: beach
      POSTGRES_DB: beachclub
    ports: ["5433:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes: { pgdata: {} }
```

`.env.example`:
```
DATABASE_URL=postgres://postgres:beach@localhost:5433/beachclub
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
PORT=3001
```

- [ ] **Step 2: Init server package with Fastify + a health route**

`server/package.json` deps: `fastify`, `@anthropic-ai/sdk`, `drizzle-orm`, `postgres`, `ws`, `zod`; dev: `tsx`, `vitest`, `drizzle-kit`, `typescript`, `@types/ws`.

`server/src/index.ts`:
```ts
import Fastify from "fastify";
export function buildServer() {
  const app = Fastify({ logger: false });
  app.get("/health", async () => ({ ok: true }));
  return app;
}
if (process.env.NODE_ENV !== "test") {
  buildServer().listen({ port: Number(process.env.PORT ?? 3001), host: "0.0.0.0" });
}
```

- [ ] **Step 3: Write failing health test**

`server/src/health.test.ts`:
```ts
import { test, expect } from "vitest";
import { buildServer } from "./index";
test("health returns ok", async () => {
  const res = await buildServer().inject({ method: "GET", url: "/health" });
  expect(res.json()).toEqual({ ok: true });
});
```

- [ ] **Step 4: Run test, expect FAIL then PASS**

Run: `cd server && pnpm vitest run src/health.test.ts`
Expected: PASS once `index.ts` exists (fails first if `buildServer` missing).

- [ ] **Step 5: Commit**

```bash
git checkout -b feat/beachclub-poc
git add -A && git commit -m "chore: monorepo scaffold + health route"
```

---

### Task 2: Shared types + seed data

**Files:**
- Create: `shared/types.ts`, `server/src/seed/club.ts`, `server/src/seed/menu.ts`
- Test: `server/src/seed/seed.test.ts`

**Interfaces:**
- Produces:
  - `type Daybed = { id: string; label: string; type: "daybed"|"cabana"|"sunbed"; x: number; z: number; capacity: number }`
  - `type MenuItem = { id: string; name: string; category: "cocktail"|"food"|"soft"; priceChf: number }`
  - `type CartLine = { itemId: string; name: string; qty: number; priceChf: number }`
  - `type Order = { id: string; daybedId: string; lines: CartLine[]; totalChf: number; createdAt: string; status: "new"|"preparing"|"ready" }`
  - `type Reservation = { id: string; daybedId: string; name: string; createdAt: string }`
  - `CLUB: Daybed[]`, `MENU: MenuItem[]`
- Consumes: nothing.

- [ ] **Step 1: Write the types** in `shared/types.ts` exactly as the Interfaces block above, plus WS event union:
```ts
export type WsEvent =
  | { type: "reservation"; daybedId: string }
  | { type: "order"; order: Order };
```

- [ ] **Step 2: Write seed data** — `club.ts` exports `CLUB` with ~16 daybeds (mix of types) laid out on a grid (`x`/`z` in meters, pool/beach zones). `menu.ts` exports `MENU` with ~12 items (cocktails: Mojito 18, Spritz 16; food: Ceviche 24, Poke 22; softs: Coco 9 …). Fictional names/prices in CHF.

- [ ] **Step 3: Write failing test**

`server/src/seed/seed.test.ts`:
```ts
import { test, expect } from "vitest";
import { CLUB } from "./club";
import { MENU } from "./menu";
test("club daybed ids are unique and positioned", () => {
  const ids = new Set(CLUB.map(d => d.id));
  expect(ids.size).toBe(CLUB.length);
  expect(CLUB.every(d => Number.isFinite(d.x) && Number.isFinite(d.z))).toBe(true);
});
test("menu has cocktails and food with positive prices", () => {
  expect(MENU.some(m => m.category === "cocktail")).toBe(true);
  expect(MENU.every(m => m.priceChf > 0)).toBe(true);
});
```

- [ ] **Step 4: Run** `pnpm vitest run src/seed/seed.test.ts` → PASS.
- [ ] **Step 5: Commit** `git commit -am "feat: shared types + fictional club & menu seed"`

---

### Task 3: Database schema + client

**Files:**
- Create: `server/src/db/schema.ts`, `server/src/db/client.ts`, `server/drizzle.config.ts`
- Test: `server/src/db/schema.test.ts`

**Interfaces:**
- Produces: Drizzle tables `reservations(id, daybedId, name, createdAt)` and `orders(id, daybedId, lines jsonb, totalChf, status, createdAt)`; `db` client; `migrate()` helper.
- Consumes: `Order`, `Reservation`, `CartLine` from `shared/types.ts`.

- [ ] **Step 1: Schema** `server/src/db/schema.ts`:
```ts
import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  daybedId: text("daybed_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  daybedId: text("daybed_id").notNull(),
  lines: jsonb("lines").notNull(),
  totalChf: integer("total_chf").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Client** `server/src/db/client.ts`:
```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```
`drizzle.config.ts` points schema → `./src/db/schema.ts`, out → `./drizzle`.

- [ ] **Step 3: Generate + push migration**

Run: `cd server && pnpm drizzle-kit generate && pnpm drizzle-kit push`
Expected: tables created (requires `docker compose up -d db` first).

- [ ] **Step 4: Write failing integration test** (skips if no DB):
```ts
import { test, expect } from "vitest";
import { db } from "./client";
import { reservations } from "./schema";
test("can insert and read a reservation", async () => {
  await db.insert(reservations).values({ id: "r1", daybedId: "d1", name: "Test" });
  const rows = await db.select().from(reservations);
  expect(rows.find(r => r.id === "r1")).toBeTruthy();
});
```

- [ ] **Step 5: Run** `pnpm vitest run src/db/schema.test.ts` → PASS. **Commit** `git commit -am "feat: drizzle schema (reservations, orders) + migration"`

---

### Task 4: Pure cart logic

**Files:**
- Create: `server/src/domain/cart.ts`
- Test: `server/src/domain/cart.test.ts`

**Interfaces:**
- Produces: `addItem(cart, item, qty): CartLine[]`, `removeItem(cart, itemId): CartLine[]`, `cartTotal(cart): number`. Pure, no IO.
- Consumes: `MenuItem`, `CartLine`.

- [ ] **Step 1: Failing tests** `cart.test.ts`:
```ts
import { test, expect } from "vitest";
import { addItem, removeItem, cartTotal } from "./cart";
const mojito = { id: "mojito", name: "Mojito", category: "cocktail" as const, priceChf: 18 };
test("adding same item twice increments qty", () => {
  let c = addItem([], mojito, 1);
  c = addItem(c, mojito, 2);
  expect(c).toEqual([{ itemId: "mojito", name: "Mojito", qty: 3, priceChf: 18 }]);
});
test("removeItem drops the line", () => {
  const c = addItem([], mojito, 1);
  expect(removeItem(c, "mojito")).toEqual([]);
});
test("cartTotal sums qty*price", () => {
  expect(cartTotal(addItem([], mojito, 2))).toBe(36);
});
```

- [ ] **Step 2: Run** → FAIL (functions undefined).
- [ ] **Step 3: Implement** `cart.ts`:
```ts
import type { MenuItem, CartLine } from "../../../shared/types";
export function addItem(cart: CartLine[], item: MenuItem, qty: number): CartLine[] {
  const i = cart.findIndex(l => l.itemId === item.id);
  if (i >= 0) return cart.map((l, k) => k === i ? { ...l, qty: l.qty + qty } : l);
  return [...cart, { itemId: item.id, name: item.name, qty, priceChf: item.priceChf }];
}
export function removeItem(cart: CartLine[], itemId: string): CartLine[] {
  return cart.filter(l => l.itemId !== itemId);
}
export function cartTotal(cart: CartLine[]): number {
  return cart.reduce((s, l) => s + l.qty * l.priceChf, 0);
}
```
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `git commit -am "feat: pure cart logic + tests"`

---

### Task 5: Reservation service (conflict-safe)

**Files:**
- Create: `server/src/domain/reservations.ts`
- Test: `server/src/domain/reservations.test.ts`

**Interfaces:**
- Produces: `createReservation(daybedId, name): Promise<Reservation>` (throws `DaybedTakenError` if already reserved), `listReservedDaybedIds(): Promise<string[]>`.
- Consumes: `db`, `reservations` table, `CLUB` (to validate daybedId exists).

- [ ] **Step 1: Failing test** (uses test DB, cleans between):
```ts
import { test, expect, beforeEach } from "vitest";
import { db } from "../db/client";
import { reservations } from "../db/schema";
import { createReservation, DaybedTakenError } from "./reservations";
beforeEach(async () => { await db.delete(reservations); });
test("second reservation of same daybed throws", async () => {
  await createReservation("d1", "A");
  await expect(createReservation("d1", "B")).rejects.toBeInstanceOf(DaybedTakenError);
});
test("unknown daybed rejected", async () => {
  await expect(createReservation("nope", "A")).rejects.toThrow();
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `reservations.ts` — validate `daybedId ∈ CLUB`, check existing row, insert with `id = crypto.randomUUID()`. Define `class DaybedTakenError extends Error`.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `git commit -am "feat: reservation service with conflict + validation"`

---

### Task 6: Order service

**Files:**
- Create: `server/src/domain/orders.ts`
- Test: `server/src/domain/orders.test.ts`

**Interfaces:**
- Produces: `createOrder(daybedId, lines): Promise<Order>` (computes total via `cartTotal`, rejects empty cart with `EmptyCartError`, persists, status `"new"`).
- Consumes: `db`, `orders`, `cartTotal`.

- [ ] **Step 1: Failing test**:
```ts
import { test, expect } from "vitest";
import { createOrder, EmptyCartError } from "./orders";
test("empty cart rejected", async () => {
  await expect(createOrder("d1", [])).rejects.toBeInstanceOf(EmptyCartError);
});
test("order total computed", async () => {
  const o = await createOrder("d1", [{ itemId: "mojito", name: "Mojito", qty: 2, priceChf: 18 }]);
  expect(o.totalChf).toBe(36);
  expect(o.status).toBe("new");
});
```
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `orders.ts`. **Step 4: Run** → PASS. **Step 5: Commit** `git commit -am "feat: order service"`

---

### Task 7: REST API routes

**Files:**
- Create: `server/src/routes/api.ts`; Modify: `server/src/index.ts` (register routes)
- Test: `server/src/routes/api.test.ts`

**Interfaces:**
- Produces: `GET /api/layout` → `CLUB`; `GET /api/menu` → `MENU`; `GET /api/reservations` → `string[]` (reserved ids); `POST /api/reservations {daybedId,name}` → `Reservation` (409 on taken); `POST /api/orders {daybedId,lines}` → `Order` (400 on empty). Each mutation also broadcasts via hub (Task 8) — wire after Task 8 exists; for now call a passed-in `onEvent` callback.
- Consumes: domain services from Tasks 4–6.

- [ ] **Step 1: Failing tests** using `app.inject` for `GET /api/menu` (200, array) and `POST /api/reservations` twice (second → 409).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `registerApi(app, { onEvent })`; map `DaybedTakenError`→409, `EmptyCartError`→400 via error handler. Register in `index.ts`.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `git commit -am "feat: REST API (layout, menu, reservations, orders)"`

---

### Task 8: WebSocket hub

**Files:**
- Create: `server/src/realtime/hub.ts`; Modify: `server/src/index.ts` (attach `ws` server on `/ws`)
- Test: `server/src/realtime/hub.test.ts`

**Interfaces:**
- Produces: `createHub()` → `{ broadcast(event: WsEvent): void, attach(server): void }`. Clients connecting to `/ws` receive JSON events. `registerApi`'s `onEvent` = `hub.broadcast`.
- Consumes: `WsEvent`.

- [ ] **Step 1: Failing test** — start hub, connect a `ws` client, `broadcast({type:"reservation",daybedId:"d1"})`, assert client receives it.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** hub with a `Set<WebSocket>`, JSON stringify on broadcast, cleanup on close. **Step 4: Run** → PASS.
- [ ] **Step 5: Wire** `onEvent: hub.broadcast` in `index.ts`. **Commit** `git commit -am "feat: WebSocket broadcast hub wired to reservations/orders"`

---

### Task 9: Agent tool dispatch (Claude brain core)

**Files:**
- Create: `shared/tools.ts`, `server/src/agent/dispatch.ts`
- Test: `server/src/agent/dispatch.test.ts`

**Interfaces:**
- Produces:
  - `TOOLS`: Anthropic tool schemas for `ajouter_article`, `retirer_article`, `lire_panier`, `confirmer_commande`.
  - `dispatchTool(name, input, ctx): { cart: CartLine[]; result: string; confirmed?: Order }` where `ctx = { daybedId, cart, menu }`. Pure-ish: cart ops use Task 4; `confirmer_commande` calls `createOrder` + returns it. This is the unit Claude's tool-use loop calls — tested WITHOUT the LLM.
- Consumes: cart logic, order service, `MENU`.

- [ ] **Step 1: Failing tests** for `dispatchTool`:
```ts
test("ajouter_article adds by fuzzy name", () => {
  const r = dispatchTool("ajouter_article", { nom: "mojito", qty: 2 },
    { daybedId: "d1", cart: [], menu: MENU });
  expect(r.cart[0].qty).toBe(2);
});
test("confirmer_commande on empty cart returns error result, no order", () => {
  const r = dispatchTool("confirmer_commande", {}, { daybedId: "d1", cart: [], menu: MENU });
  expect(r.confirmed).toBeUndefined();
});
```
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `dispatch.ts` (fuzzy match item name → MenuItem; unknown item → `result: "article introuvable"`) and `TOOLS` schemas in `shared/tools.ts`.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `git commit -am "feat: agent tool dispatch (cart/order ops) decoupled from LLM"`

---

### Task 10: Claude turn loop + text chat endpoint

**Files:**
- Create: `server/src/agent/brain.ts`; Modify: `server/src/routes/api.ts` (`POST /api/agent/message`)
- Test: `server/src/agent/brain.test.ts`

**Interfaces:**
- Produces: `runAgentTurn({ daybedId, history, cart }): Promise<{ reply: string; cart: CartLine[]; order?: Order }>` — calls Anthropic with `TOOLS`, executes returned tool_use blocks through `dispatchTool`, loops until the model stops, returns final assistant text + new cart. `POST /api/agent/message {daybedId, message, cart}` wraps it.
- Consumes: `@anthropic-ai/sdk`, `TOOLS`, `dispatchTool`.

- [ ] **Step 1: Failing test** with the Anthropic client mocked (inject a fake `messages.create` returning one `tool_use` for `ajouter_article` then an end turn). Assert returned `cart` has the item and `reply` is a string. Use dependency injection: `runAgentTurn(args, { client })`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `brain.ts` (model `claude-sonnet-4-6` for cost/latency; system prompt: French beach-club waiter, concise, always confirm before `confirmer_commande`, knows daybed). Default client from `ANTHROPIC_API_KEY`. Wire endpoint.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `git commit -am "feat: Claude order brain + text chat endpoint"`

> **Reference:** read the `claude-api` skill before writing `brain.ts` — confirm model id, tool-use loop shape, and streaming params.

---

### Task 11: Gemini Live voice proxy

**Files:**
- Create: `server/src/voice/geminiProxy.ts`; Modify: `server/src/index.ts` (attach on `/ws/voice`)
- Test: `server/src/voice/geminiProxy.test.ts`

**Interfaces:**
- Produces: `attachVoiceProxy(server)` — browser connects `/ws/voice`, the proxy opens an upstream Gemini Live session configured with ONE function declaration `passer_commande(texte)`. On a Gemini function call, the proxy runs `runAgentTurn` (Claude), feeds the textual result back to Gemini as the function response (Gemini speaks it), and forwards the updated cart to the browser as a control frame `{type:"cart", cart}`. Audio frames pass through both directions.
- Consumes: Gemini Live SDK/WS, `runAgentTurn`.

- [ ] **Step 1: Failing test** of the routing logic only (no real Gemini): extract `handleGeminiFunctionCall(call, ctx, { runAgentTurn })` and assert that a `passer_commande` call invokes `runAgentTurn` and returns a `functionResponse` with the reply text + emits a `cart` frame. Mock `runAgentTurn`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `geminiProxy.ts` with `handleGeminiFunctionCall` isolated and unit-tested; the raw socket plumbing (upstream connect, audio passthrough) lives in `attachVoiceProxy` and is verified manually.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `git commit -am "feat: Gemini Live voice proxy delegating reasoning to Claude"`

> **Reference:** read the `llm-app-dev` skill and reuse the Eva Gemini Live native-audio WS-proxy pattern (`gemini-live-2.5-flash-native-audio`).

---

### Task 12: Client scaffold (router, store, WS client)

**Files:**
- Create: `client/` (Vite React TS), `client/src/store.ts`, `client/src/ws.ts`, `client/src/App.tsx`, router, Tailwind + shadcn init
- Test: `client/src/store.test.ts`

**Interfaces:**
- Produces: zustand store `{ reservedIds:Set, cart:CartLine[], orders:Order[], addLine, removeLine, applyWsEvent }`; `connectWs(onEvent)` client; routes `/`, `/d/:id`, `/kds`.
- Consumes: `WsEvent`, `CartLine`, `Order`.

- [ ] **Step 1: Failing test** for `applyWsEvent` — applying `{type:"reservation",daybedId:"d1"}` adds `d1` to `reservedIds`; `{type:"order",order}` prepends to `orders`.
- [ ] **Step 2: Run** (`pnpm vitest run` in client, jsdom) → FAIL.
- [ ] **Step 3: Implement** store + ws client + routing. Tailwind config with warm sunset palette tokens.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `git commit -am "feat: client scaffold (router, zustand store, ws client)"`

> **Reference:** use `ui-ux-pro-max` + `frontend-design` for the visual system (glassmorphism, sunset palette) before building pages.

---

### Task 13: 3D booking scene

**Files:**
- Create: `client/src/scenes/ClubScene.tsx`, `client/src/pages/Booking.tsx`, `client/src/components/ReserveModal.tsx`
- Test: covered by E2E (Task 16) + manual visual

**Interfaces:**
- Consumes: `GET /api/layout`, `GET /api/reservations`, store `reservedIds`, `POST /api/reservations`.
- Produces: clickable daybeds; free = teal, reserved = grey (driven by `reservedIds`, updates live via WS).

- [ ] **Step 1: Build `ClubScene`** with r3f: `<Canvas>` + `OrbitControls`, a sand/pool/sea ground, and a `<Daybed>` mesh per `CLUB` entry positioned at `[x,0,z]`. Stylized primitives (boxes + rounded geometry), warm directional light, soft sky.
- [ ] **Step 2: Interaction** — `onClick` a free daybed opens `ReserveModal` (name input) → `POST /api/reservations` → on 200, optimistic + rely on WS broadcast to mark reserved. Show a "Réserver" CTA and a generated QR/`Aller au daybed` button linking to `/d/:id`.
- [ ] **Step 3: Visual check** — use `frontend-visual-iteration` skill to screenshot `/` and refine layout/colors until it reads as a premium beach club.
- [ ] **Step 4: Commit** `git commit -am "feat: interactive 3D club booking scene"`

> **Reference:** `web-3d-experiences` for r3f/drei patterns, Draco/perf; keep geometry stylized for fast mobile load.

---

### Task 14: Daybed ordering page (menu + chat + mic)

**Files:**
- Create: `client/src/pages/Daybed.tsx`, `client/src/components/{MenuGrid,Cart,ChatPanel,MicButton}.tsx`
- Test: component test for tap-to-add; voice manual

**Interfaces:**
- Consumes: `GET /api/menu`, `POST /api/agent/message` (text), `/ws/voice` (voice), store cart.
- Produces: working order flow even if AI is down (tap-to-add fallback).

- [ ] **Step 1: MenuGrid + Cart** — tap an item → `store.addLine` (uses shared cart logic); cart shows lines + total; "Commander" → `POST /api/orders`. Failing component test: clicking a menu card adds a cart line.
- [ ] **Step 2: ChatPanel** — text box → `POST /api/agent/message` with current cart → render reply, replace cart with returned cart; if it returns an `order`, show confirmation.
- [ ] **Step 3: MicButton** — connect `/ws/voice`, stream mic audio, play returned audio, apply `{type:"cart"}` control frames. On mic-permission/connect failure → toast "micro indispo, tapez votre commande" and keep chat usable.
- [ ] **Step 4: Run** component test → PASS. **Commit** `git commit -am "feat: daybed ordering page (menu, cart, chat, voice, fallback)"`

---

### Task 15: KDS bar/kitchen screen

**Files:**
- Create: `client/src/pages/Kds.tsx`, `client/src/components/OrderCard.tsx`
- Test: covered by E2E (Task 16)

**Interfaces:**
- Consumes: `GET /api/orders` (initial, add route in api.ts if needed) + WS `order` events via store.
- Produces: live-updating board; newest order animates in (Framer Motion); shows daybed label, lines, total, time.

- [ ] **Step 1: Render** orders from store, newest first, grouped/animated. Big readable cards for stage display.
- [ ] **Step 2: Live** — confirm a new order broadcast pops a card without refresh (visual check).
- [ ] **Step 3: Commit** `git commit -am "feat: live KDS bar/kitchen screen"`

---

### Task 16: End-to-end test (book → order → KDS)

**Files:**
- Create: `client/e2e/booking-to-kds.spec.ts`, `client/playwright.config.ts`

**Interfaces:**
- Consumes: full stack running (server + client + db).

- [ ] **Step 1: Write E2E**: open `/` in one context, reserve a daybed; open `/d/:id`, add items via tap-to-order, confirm; open `/kds` in a second context and assert the order appears with correct total.
- [ ] **Step 2: Run** `pnpm playwright test` → PASS.
- [ ] **Step 3: Commit** `git commit -am "test: e2e booking-to-order-to-kds happy path"`

---

### Task 17: Dockerize + deploy to VPS

**Files:**
- Create: `Dockerfile` (multi-stage: build client → serve via server static + API), `docker-compose.prod.yml` (app + postgres) with Traefik labels, `.dockerignore`

**Interfaces:**
- Produces: live `https://beachclub.mbbssarl.ch` with all three screens.

- [ ] **Step 1: Dockerfile** — build `client` (Vite) and `server` (tsc), final image runs Fastify serving the built client + API + WS. Expose `3001`.
- [ ] **Step 2: Compose + Traefik labels** for host `beachclub.mbbssarl.ch`, host-mode Traefik network (per `vps-deploy-hostinger` skill). Postgres service with a named volume. Env from server `.env` (secrets injected on VPS, NOT committed).
- [ ] **Step 3: DNS** — create `beachclub.mbbssarl.ch` A record → `76.13.55.44` via Hostinger MCP.
- [ ] **Step 4: Deploy** via the `vps-deploy-hostinger` skill (GHCR image + `VPS_createNewProjectV1`), isolated stack. Recreate WITH Traefik labels (avoid the known 404 gotcha).
- [ ] **Step 5: Verify** — `curl -I https://beachclub.mbbssarl.ch` → 200; load `/`, `/kds`; place a test order end to end. **Commit** `git commit -am "chore: dockerize + deploy beachclub to VPS behind Traefik"`

> **Reference:** `vps-deploy-hostinger` skill. Confirm this lands on VPS 76.13.55.44 (general), NOT the medical VPS.

---

## Self-Review

**Spec coverage:**
- 3 screens (booking 3D / daybed order / KDS) → Tasks 13/14/15. ✓
- Voice Gemini + reasoning Claude split → Tasks 10 (Claude) + 11 (Gemini proxy delegating to Claude). ✓
- Shared tools voice/text → Task 9 (`shared/tools.ts`, `dispatchTool`). ✓
- Tap-to-order safety net → Task 14 Step 1. ✓
- Reservation conflict + live sync → Tasks 5 + 8 + 13. ✓
- KDS live via WS → Tasks 8 + 15. ✓
- Error handling (mic fallback, AI-down fallback, double booking) → Tasks 14/5. ✓
- Vitest + Playwright → Tasks 4–12 (unit) + 16 (E2E). ✓
- Deploy Traefik VPS 76 + DNS + `.env` secrets → Task 17. ✓
- Non-goals (no payments/login/back-office/multi-tenant/native/real data) → none implemented. ✓

**Placeholder scan:** No TBD/TODO; logic-heavy tasks carry real code; UI/3D tasks give concrete component contracts + reference skills (acceptable since they are visual/iterative, verified by E2E + visual iteration).

**Type consistency:** `CartLine`, `Order`, `Reservation`, `WsEvent` defined once in `shared/types.ts` (Task 2) and reused verbatim. `dispatchTool`/`runAgentTurn`/`createOrder`/`createReservation` signatures consistent across Tasks 5/6/9/10/11.
