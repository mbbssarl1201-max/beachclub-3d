# Beach Club 3D — POC de pitch : réservation 3D + commande par agent IA

**Date** : 2026-06-28
**Projet** : `~/beachclub-3d` (isolé — aucun lien avec le VPS médical ni les projets PHI)
**Statut** : design validé, en attente de relecture spec

---

## 1. Problème & objectif

Le modèle d'un beach club premium (référence : Finns, Bali) repose sur beaucoup de
serveurs, et les commandes prennent du temps → expérience client dégradée + coût staff
élevé.

**Objectif du POC** : une démo web "wow", à pitcher en live, qui prouve qu'on peut
**réserver et commander sans serveur**, via deux effets de manche :

1. la **réservation sur un plan 3D interactif** du club ;
2. la **commande par agent IA (voix + texte)** déclenchée au daybed via QR ;
3. avec **preuve en direct sur un écran bar/cuisine** (la commande arrive instantanément).

### Scénario de réussite du pitch (en live, 4 étapes)

1. Je tourne la caméra dans le plan 3D du club, je clique un daybed libre, je le réserve.
2. Je « scanne » le QR du daybed → l'interface s'ouvre en sachant où je suis assis.
3. Je commande à la voix (« 2 mojitos et un ceviche »), fallback chat si besoin ;
   l'agent confirme.
4. La commande **apparaît instantanément** sur l'écran bar/cuisine affiché à côté.

## 2. Non-goals (hors périmètre — POC livrable vite)

- ❌ Vrais paiements (Stripe/TWINT) — on simule « payé ».
- ❌ Comptes clients / login / historique.
- ❌ Back-office complet (gestion menu, stock, staff, statistiques).
- ❌ Multi-tenant / revente SaaS — un seul club fictif en dur.
- ❌ App mobile native — web responsive (le QR ouvre une page web).
- ❌ Données réelles Finns — club, carte et photos **fictifs** (zéro risque de marque).

## 3. Architecture générale

Une seule app web responsive + un backend, trois « écrans » servis par le même backend :

| Écran | Route | Rôle |
|---|---|---|
| **Réservation 3D** | `/` | Plan 3D du club, caméra orbitale, clic daybed libre → réservé |
| **Commande au daybed** | `/d/:daybedId` | Ouvert par le QR ; contexte daybed + carte + **micro (voix) + chat** |
| **Écran bar/cuisine (KDS)** | `/kds` | Liste live des commandes entrantes, temps réel |

### Stack

- **Front** : Vite + React + TypeScript, `react-three-fiber` + `@react-three/drei` (3D),
  Framer Motion, Tailwind + shadcn/ui, zustand (état UI), client WebSocket.
- **Back** : Node + Fastify, **Drizzle ORM + Postgres**, hub **WebSocket** (`ws`),
  SDK Anthropic (Claude), proxy WS vers Gemini Live.
- **Données** : layout du club + carte = **JSON seedé en dur** (fictif) ; réservations
  et commandes en Postgres (synchronisation entre les trois écrans via WS).

### Découpage en unités (responsabilité unique)

- `client/` — app React (scène 3D, page commande, page KDS), aucun secret.
- `server/api/` — REST : layout, carte, réservations, commandes.
- `server/realtime/` — hub WebSocket : broadcast des events `reservation` et `order`.
- `server/agent/` — **cerveau Claude** : interprète une demande en langage naturel →
  actions sur le panier (`ajouter_article`, etc.) ; unique source de vérité du raisonnement.
- `server/voice/` — **proxy WS Gemini Live** : pont audio navigateur ↔ Gemini ; délègue
  la décision de commande à `server/agent/`.
- `shared/` — types + schémas d'outils partagés voix/texte.

## 4. Le cerveau IA (commande)

Architecture « bouche/oreilles vs cerveau » : **Gemini Live = la voix, Claude = le raisonnement.**

- **Voix — Gemini Live native-audio** via **proxy WS** côté backend (modèle type
  `gemini-live-2.5-flash-native-audio`, clé Google AI Studio ou Vertex EU comme Eva).
  Le navigateur parle au backend en WS ; le backend relaie vers Gemini ; l'auth n'est
  jamais exposée au front. Gemini gère l'audio temps réel et le tour de parole, et expose
  **une seule fonction** `passer_commande(texte)` dont l'exécution appelle le cerveau Claude,
  puis Gemini **prononce** la réponse courte renvoyée.
- **Texte — Claude API** : le front appelle directement le cerveau Claude (mêmes outils).
  Comportement identique voix/texte.
- **Outils (tool-calling) partagés** : `ajouter_article(nom, qty)`, `retirer_article(nom)`,
  `lire_panier()`, `confirmer_commande()`. L'agent connaît le `daybedId` (contexte injecté).
- **Filet de sécurité pitch** 🛟 : la carte reste **cliquable à la main** (tap-to-add). Si
  l'IA ou le réseau lâche en live, la commande fonctionne quand même → la démo ne meurt jamais.

## 5. Flux de données

1. **Réserver** : clic daybed → `POST /reservations` → DB → broadcast WS → le daybed passe
   « réservé » pour **tous** les écrans 3D connectés en direct.
2. **QR** : `/d/:daybedId` charge le contexte daybed (dans la démo, un bouton « scanner »
   simule l'ouverture de la page).
3. **Commander** : voix (Gemini→Claude) ou chat (Claude direct) → outils → panier se remplit
   → `confirmer_commande` → `POST /orders` → DB → **broadcast WS → la commande pop sur le KDS
   instantanément**.

## 6. Gestion d'erreurs

- Micro refusé / réseau voix KO → **bascule auto en chat** (bannière explicite).
- IA / réseau indispo → **tap-to-order** garde la commande fonctionnelle.
- Daybed pris en double (course) → le serveur rejette à l'écriture, UI « déjà réservé »,
  l'état se resynchronise via WS.

## 7. Tests

- **Vitest** : logique panier, handlers d'outils Claude, conflit de réservation.
- **Playwright E2E** : réserver un daybed → commander en chat → vérifier l'arrivée sur le KDS.
- **Manuel** : test voix Gemini Live en conditions réelles avant le pitch.

## 8. Déploiement

- Docker + image GHCR, derrière **Traefik sur le VPS MBBS 76.13.55.44** (général — **pas**
  le médical), sous-domaine `beachclub.mbbssarl.ch` (création DNS Hostinger).
- Secrets (`ANTHROPIC_API_KEY`, clé Gemini/Vertex) dans `.env` **gitignoré**, jamais versionnés.
- Healthcheck + ping HTTP après déploiement (200 + écrans accessibles).

## 9. Identité visuelle (cap, détaillé au plan)

Beach club premium au coucher de soleil : dégradés chauds, verre dépoli (glassmorphism),
typographie soignée, micro-animations Framer Motion. Plan 3D stylisé (piscine, daybeds,
cabanas, plage, mer) plutôt que photoréaliste — charge vite sur mobile.
