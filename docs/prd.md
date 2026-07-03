# Beach Club 3D — Product Requirements Document (PRD)

**Méthode : BMAD** · Version 1.0 · 2026-06-28 · Auteur : MBBS Sàrl
**Type : POC de pitch** (données fictives, déploiement démo)

> **Note d'état (2026-07-03)** — Le produit livré a pivoté par rapport à ce PRD sur deux points :
> le « plan 3D interactif » (react-three-fiber) est devenu une **carte aérienne 2D pannable/zoomable
> avec pins, façon Finns Bali** (même valeur de démo, moins de risque), et la base Postgres est
> remplacée par **PGlite embarqué** (volume Docker `beachclub_data`). Tout le reste (agent IA voix +
> texte, KDS temps réel, déploiement isolé) est conforme. Démo en ligne :
> `https://beachclub.76-13-55-44.sslip.io` (en attendant le DNS `beachclub.mbbssarl.ch`).

---

## 1. Goals and Background Context

### Goals
- Démontrer en live qu'un beach club peut **réserver et commander sans serveur**.
- Effet « wow » de pitch via un **plan 3D interactif** de réservation.
- Prouver la **rapidité de commande** par agent IA (voix Gemini Live + texte Claude).
- Montrer la **preuve opérationnelle** : la commande arrive instantanément sur un écran bar/cuisine.
- Livrer vite : POC déployé sur `beachclub.mbbssarl.ch`, isolé du reste de l'infra.

### Background Context
Les beach clubs premium (réf. Finns, Bali) emploient beaucoup de serveurs ; les commandes
sont lentes aux heures de pointe, dégradant l'expérience et alourdissant les coûts. Ce POC
propose un parcours self-service : le client réserve son daybed sur un jumeau 3D du club, puis
commande directement depuis sa place via un agent IA conversationnel. La commande est routée
en temps réel vers le bar/cuisine. L'objectif n'est pas un produit fini mais une démonstration
convaincante à présenter à des prospects, construite dans la stack TypeScript standard MBBS.

### Change Log
| Date | Version | Description | Auteur |
|---|---|---|---|
| 2026-06-28 | 1.0 | PRD initial (POC) | MBBS |

---

## 2. Requirements

### Functional (FR)
- **FR1** : Le système affiche un plan 3D du club avec daybeds/cabanas positionnés, caméra orbitale.
- **FR2** : Le client clique un daybed libre et le réserve (nom requis) ; un daybed réservé n'est plus réservable.
- **FR3** : Les réservations se propagent en temps réel à tous les écrans 3D connectés.
- **FR4** : Un QR (simulé par un bouton dans la démo) ouvre la page de commande contextualisée au daybed.
- **FR5** : Le client commande par **voix** (Gemini Live native-audio) — l'agent comprend, propose, confirme.
- **FR6** : Le client peut commander par **chat texte** (Claude) avec un comportement identique à la voix.
- **FR7** : L'agent dispose des outils `ajouter_article`, `retirer_article`, `lire_panier`, `confirmer_commande`.
- **FR8** : Le raisonnement de commande est assuré **uniquement par Claude** ; Gemini délègue via `passer_commande`.
- **FR9** : **Tap-to-order** — le client peut ajouter des articles à la main ; la commande fonctionne même IA/voix HS.
- **FR10** : À la confirmation, la commande est persistée et **broadcastée en direct sur l'écran bar/cuisine (KDS)**.
- **FR11** : Le KDS affiche les commandes entrantes (daybed, articles, total, heure), la plus récente animée.
- **FR12** : Carte et plan du club sont des **données fictives** seedées.

### Non-Functional (NFR)
- **NFR1** : Stack TypeScript MBBS — Vite/React/r3f côté front, Fastify/Drizzle/Postgres/ws côté back.
- **NFR2** : Secrets (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`) dans `.env` gitignoré, jamais versionnés.
- **NFR3** : Projet **isolé** — aucune ressource partagée avec le VPS médical ni un projet PHI.
- **NFR4** : 3D stylisée (pas photoréaliste) pour un **chargement rapide sur mobile**.
- **NFR5** : Latence voix perçue acceptable pour un live (confirmations courtes ; Gemini→Claude→Gemini optimisé).
- **NFR6** : Robustesse pitch : fallback chat si voix KO, fallback tap-to-order si IA KO.
- **NFR7** : Déploiement Docker derrière Traefik sur VPS 76.13.55.44, HTTPS, healthcheck + ping post-deploy.
- **NFR8** : Tests automatisés Vitest (logique) + Playwright (E2E parcours nominal).

### Out of Scope (Non-Goals)
Vrais paiements, comptes/login, back-office menu/stock/staff, multi-tenant SaaS, app native, données réelles Finns.

---

## 3. User Interface Design Goals

- **Vision UX** : premium, balnéaire, coucher de soleil — dégradés chauds, glassmorphism, typographie soignée, micro-animations (Framer Motion). Immersif mais épuré.
- **Paradigmes d'interaction** : caméra orbitale 3D pour explorer/réserver ; conversation voix-first avec fallback chat ; grille de carte tactile.
- **Écrans clés** : (1) Réservation 3D `/` ; (2) Commande daybed `/d/:id` ; (3) KDS bar/cuisine `/kds`.
- **Accessibilité** : contrastes lisibles (cible WCAG AA sur les textes), cibles tactiles ≥ 44px ; non bloquant pour le POC.
- **Branding** : club fictif (nom/identité inventés), aucune marque réelle.
- **Plateforme cible** : Web responsive (mobile guest + grand écran KDS).

---

## 4. Technical Assumptions

- **Repository** : monorepo pnpm unique (`shared` / `server` / `client`).
- **Architecture de service** : monolithe applicatif (Fastify sert l'API + le client buildé + le hub WS + le proxy voix).
- **IA** : Claude (`claude-sonnet-4-6`) = cerveau/raisonnement + tool-calling ; Gemini Live native-audio = canal voix, délègue à Claude. Pattern proxy WS réutilisé d'Eva.
- **Données** : Postgres (Drizzle) pour réservations/commandes ; club + carte en JSON seedé.
- **Temps réel** : WebSocket (`ws`) pour réservations et commandes.
- **Tests** : Vitest (unitaire/intégration), Playwright (E2E). TDD sur la logique métier.
- **Déploiement** : Docker + GHCR + Traefik (host-mode) sur VPS 76.13.55.44 ; DNS via Hostinger MCP.
- **Contraintes** : ne pas push sur `main` ; branche `feat/beachclub-poc`.

---

## 5. Epic List

- **Epic 1 — Socle & domaine** : monorepo, types/seed, DB, logique panier/réservation/commande, API REST, hub WS. *Livrable : un backend testé qui réserve et enregistre des commandes, synchronisé en temps réel.*
- **Epic 2 — Cerveau IA de commande** : outils partagés, dispatch, boucle Claude + endpoint chat, proxy voix Gemini déléguant à Claude. *Livrable : commander en langage naturel (texte et voix) qui aboutit à une commande réelle.*
- **Epic 3 — Expérience & écrans** : scaffold client, scène 3D de réservation, page de commande (carte/chat/micro + tap-to-order), écran KDS live, E2E. *Livrable : la démo complète jouable de bout en bout.*
- **Epic 4 — Déploiement démo** : Docker, Traefik, DNS, mise en ligne et vérification. *Livrable : `https://beachclub.mbbssarl.ch` live.*

> Mapping vers le plan d'implémentation : Epic 1 = Tâches 1–8 · Epic 2 = Tâches 9–11 · Epic 3 = Tâches 12–16 · Epic 4 = Tâche 17.

---

## 6. Epic Details

### Epic 1 — Socle & domaine
**Objectif** : poser le monorepo et toute la logique métier testée, sans IA ni 3D, jusqu'à un backend
qui réserve un daybed et enregistre une commande, le tout diffusé en temps réel.

- **Story 1.1** — *Scaffold monorepo* : en tant que dev, j'ai un workspace pnpm (shared/server/client) qui démarre.
  - AC1 : `pnpm dev` lance Fastify (:3001) et Vite (:5173). AC2 : `GET /health` → `{ok:true}`, testé.
- **Story 1.2** — *Types & seed* : modèles partagés + club/carte fictifs.
  - AC1 : `CLUB` (ids uniques, positions valides) et `MENU` (cocktails/food, prix > 0) testés.
- **Story 1.3** — *Schéma DB* : tables `reservations` et `orders` via Drizzle + migration.
  - AC1 : migration applique les tables. AC2 : insert/select réservation testé.
- **Story 1.4** — *Logique panier* : `addItem/removeItem/cartTotal` purs.
  - AC1 : ajout incrémente la qty ; total = Σ qty×prix ; tests verts.
- **Story 1.5** — *Réservation* : `createReservation` rejette daybed pris/inconnu.
  - AC1 : 2e réservation du même daybed → `DaybedTakenError` ; daybed inconnu rejeté.
- **Story 1.6** — *Commande* : `createOrder` calcule le total, rejette panier vide.
  - AC1 : panier vide → `EmptyCartError` ; total persisté ; statut `new`.
- **Story 1.7** — *API REST* : layout, menu, réservations, commandes.
  - AC1 : `GET /api/menu` 200 array ; 2e `POST /api/reservations` même daybed → 409 ; panier vide → 400.
- **Story 1.8** — *Hub WS* : broadcast réservation/commande aux clients.
  - AC1 : un client `/ws` reçoit l'event broadcasté ; les mutations API émettent l'event.

### Epic 2 — Cerveau IA de commande
**Objectif** : commander en langage naturel (texte Claude + voix Gemini déléguant à Claude) jusqu'à une commande réelle.

- **Story 2.1** — *Outils & dispatch* : `TOOLS` + `dispatchTool` (cart/order) découplés du LLM.
  - AC1 : `ajouter_article` fuzzy-match ajoute l'article ; `confirmer_commande` panier vide → pas d'ordre, résultat d'erreur.
- **Story 2.2** — *Cerveau Claude + chat* : `runAgentTurn` exécute la boucle tool-use ; `POST /api/agent/message`.
  - AC1 : avec client Anthropic mocké renvoyant un tool_use, le cart final contient l'article et `reply` est une string.
- **Story 2.3** — *Voix Gemini* : proxy WS `/ws/voice`, fonction `passer_commande` → `runAgentTurn`.
  - AC1 : `handleGeminiFunctionCall('passer_commande', …)` appelle `runAgentTurn` et renvoie une `functionResponse` + frame `cart`.

### Epic 3 — Expérience & écrans
**Objectif** : la démo complète jouable — réserver en 3D, commander (voix/chat/tap), voir la commande sur le KDS.

- **Story 3.1** — *Scaffold client* : router, store zustand, client WS.
  - AC1 : `applyWsEvent` met à jour `reservedIds`/`orders` ; tests verts.
- **Story 3.2** — *Scène 3D de réservation* : daybeds cliquables, états libre/réservé live.
  - AC1 : cliquer un daybed libre ouvre la modale et crée la réservation ; un daybed réservé apparaît grisé via WS.
- **Story 3.3** — *Page de commande* : carte tactile + chat + micro + fallback.
  - AC1 : tap article → ligne au panier ; chat renvoie un cart mis à jour ; micro KO → bascule chat (toast).
- **Story 3.4** — *Écran KDS* : commandes live, plus récente animée.
  - AC1 : une commande confirmée apparaît sur `/kds` sans refresh, avec total correct.
- **Story 3.5** — *E2E* : réserver → commander (tap) → vérifier sur KDS.
  - AC1 : Playwright passe le parcours nominal de bout en bout.

### Epic 4 — Déploiement démo
**Objectif** : POC en ligne et vérifié.

- **Story 4.1** — *Dockerize* : image multi-stage (client build + server) servie par Fastify.
  - AC1 : image build et tourne localement ; `/` et `/api/health` répondent.
- **Story 4.2** — *Deploy VPS* : Traefik labels, DNS, mise en ligne isolée.
  - AC1 : `https://beachclub.mbbssarl.ch` → 200 ; parcours testé en prod ; déployé sur VPS 76.13.55.44 (pas le médical).

---

## 7. Next Steps

Exécution pilotée par le plan `docs/superpowers/plans/2026-06-28-beachclub-3d-demo.md`,
tâche par tâche en TDD (subagent-driven). Démarrage : Epic 1 / Story 1.1.
