import type { Venue, Zone, Furniture, Hotspot } from "@beachclub/shared/types";
import { MENU } from "./menu";

// Fictional beach club "Lagune". Coordinates are percentages over the aerial image.
// Mirrors the Finns booking pattern: zones of bookable furniture + points-of-interest pins.

const zones: Zone[] = [
  { id: "vip-oceanfront", name: "VIP Beach Club Oceanfront", blurb: "Premier rang face à la mer, service dédié." },
  { id: "garden-party", name: "Garden Party", blurb: "Sous les palmiers, ambiance lounge DJ." },
  { id: "beach-lagoon", name: "Beach Party Lagoon", blurb: "Autour du lagon, pieds dans l'eau." },
  { id: "beach-pool", name: "Beach Party Pool", blurb: "La grande piscine festive." },
  { id: "vip-private", name: "VIP Private Pool & Cabana", blurb: "Cabanas privées avec piscine privative." },
  { id: "sunset", name: "Sunset Lounge & Cabana", blurb: "Le meilleur coucher de soleil du club." },
];

// Bookable furniture. `id` doubles as the reservation daybedId.
// Coordinates are % over aerial.jpg, mapped to the Finns booking-map disposition:
// white resort buildings + gold pavilion along the TOP, emerald Garden Party lawn
// with a daybed grid CENTER-LEFT, the curvy turquoise lagoon (thatched bars + round
// in-water platforms) CENTER, the pool on the RIGHT, and the sand beach with daybed
// rows along the BOTTOM meeting the ocean (bottom-right).
const furniture: Furniture[] = [
  // VIP Oceanfront (beach loungers on the sand near the sea, bottom)
  { id: "vo1", label: "Oceanfront 1", zoneId: "vip-oceanfront", type: "cabana", capacity: 6, priceChf: 480, x: 52, y: 78 },
  { id: "vo2", label: "Oceanfront 2", zoneId: "vip-oceanfront", type: "daybed", capacity: 4, priceChf: 290, x: 60, y: 83 },
  { id: "vo3", label: "Oceanfront 3", zoneId: "vip-oceanfront", type: "daybed", capacity: 4, priceChf: 290, x: 68, y: 87 },
  { id: "vo4", label: "Oceanfront 4", zoneId: "vip-oceanfront", type: "daybed", capacity: 4, priceChf: 290, x: 46, y: 82 },
  // Garden Party (emerald lawn daybed grid, center-left)
  { id: "gp1", label: "Garden 1", zoneId: "garden-party", type: "daybed", capacity: 4, priceChf: 210, x: 23, y: 40 },
  { id: "gp2", label: "Garden 2", zoneId: "garden-party", type: "daybed", capacity: 4, priceChf: 210, x: 30, y: 48 },
  { id: "gp3", label: "Garden 3", zoneId: "garden-party", type: "sunbed", capacity: 2, priceChf: 120, x: 21, y: 56 },
  { id: "gp4", label: "Garden 4", zoneId: "garden-party", type: "sunbed", capacity: 2, priceChf: 120, x: 32, y: 62 },
  // Beach Lagoon (around the central free-form lagoon)
  { id: "bl1", label: "Lagoon 1", zoneId: "beach-lagoon", type: "daybed", capacity: 4, priceChf: 240, x: 50, y: 35 },
  { id: "bl2", label: "Lagoon 2", zoneId: "beach-lagoon", type: "daybed", capacity: 4, priceChf: 240, x: 58, y: 43 },
  { id: "bl3", label: "Lagoon 3", zoneId: "beach-lagoon", type: "platform", capacity: 8, priceChf: 360, x: 62, y: 33 },
  { id: "bl4", label: "Lagoon 4", zoneId: "beach-lagoon", type: "sunbed", capacity: 2, priceChf: 130, x: 47, y: 47 },
  // Beach Pool (right part of the pool, near the gold pavilion)
  { id: "bp1", label: "Pool 1", zoneId: "beach-pool", type: "daybed", capacity: 4, priceChf: 230, x: 72, y: 30 },
  { id: "bp2", label: "Pool 2", zoneId: "beach-pool", type: "daybed", capacity: 4, priceChf: 230, x: 76, y: 36 },
  { id: "bp3", label: "Pool 3", zoneId: "beach-pool", type: "platform", capacity: 8, priceChf: 350, x: 70, y: 23 },
  { id: "bp4", label: "Pool 4", zoneId: "beach-pool", type: "sunbed", capacity: 2, priceChf: 130, x: 75, y: 42 },
  // VIP Private Pool & Cabana (thatched pavilion + plunge pool, bottom-center)
  { id: "vp1", label: "Private Cabana 1", zoneId: "vip-private", type: "vip_cabana", capacity: 8, priceChf: 690, x: 36, y: 74 },
  { id: "vp2", label: "Private Cabana 2", zoneId: "vip-private", type: "vip_cabana", capacity: 8, priceChf: 690, x: 41, y: 79 },
  { id: "vp3", label: "Private Cabana 3", zoneId: "vip-private", type: "cabana", capacity: 6, priceChf: 460, x: 31, y: 80 },
  // Sunset (far right, towards the beach & sea)
  { id: "su1", label: "Sunset Cabana 1", zoneId: "sunset", type: "cabana", capacity: 6, priceChf: 420, x: 82, y: 60 },
  { id: "su2", label: "Sunset Lounge 2", zoneId: "sunset", type: "daybed", capacity: 4, priceChf: 250, x: 87, y: 67 },
  { id: "su3", label: "Sunset Lounge 3", zoneId: "sunset", type: "daybed", capacity: 4, priceChf: 250, x: 80, y: 69 },
  { id: "su4", label: "Surf Deck", zoneId: "sunset", type: "platform", capacity: 10, priceChf: 520, x: 89, y: 74 },
];

const hotspots: Hotspot[] = [
  // Entries & boutiques — along the TOP (white resort buildings)
  { id: "h-priority-entry", label: "Priority Entry", kind: "entry", x: 25, y: 5 },
  { id: "h-main-entry", label: "Main Entry", kind: "entry", x: 52, y: 5 },
  { id: "h-priority-boutique", label: "Lagune Priority Boutique", kind: "boutique", x: 12, y: 13 },
  { id: "h-grand-boutique", label: "Lagune Grand Boutique", kind: "boutique", x: 64, y: 8 },
  // Restaurants
  { id: "h-monsoon", label: "Monsoon", kind: "restaurant", x: 16, y: 22 },
  { id: "h-beach-restaurant", label: "Beach Party Restaurant", kind: "restaurant", x: 66, y: 15, zoneId: "beach-pool" },
  // Bars
  { id: "h-gazebo", label: "Gazebo Bar", kind: "bar", x: 54, y: 26, zoneId: "beach-lagoon" },
  { id: "h-garden-bar", label: "Garden Party Bar", kind: "bar", x: 19, y: 33, zoneId: "garden-party" },
  { id: "h-long-bar", label: "Long Bar", kind: "bar", x: 14, y: 46 },
  { id: "h-flippas", label: "Flippas", kind: "bar", x: 80, y: 11, zoneId: "sunset" },
  { id: "h-ocean-bar", label: "Ocean Bar", kind: "bar", x: 66, y: 73, zoneId: "vip-oceanfront" },
  // Party / stage
  { id: "h-party-platforms", label: "Party Platforms", kind: "zone", x: 60, y: 50, zoneId: "beach-lagoon" },
  { id: "h-stage", label: "Stage", kind: "stage", x: 44, y: 29 },
  { id: "h-dance-floor", label: "Dance Floor", kind: "stage", x: 36, y: 66, zoneId: "garden-party" },
  { id: "h-party-zone", label: "Party Zone", kind: "zone", x: 50, y: 58 },
  { id: "h-surf-deck", label: "Surf Deck", kind: "zone", x: 90, y: 78, zoneId: "sunset" },
  { id: "h-beach-access", label: "Beach Access", kind: "zone", x: 60, y: 93 },
];

// Add-ons = the shared MENU, so the wizard sells exactly what the agent can serve.
export const VENUE: Venue = { name: "Lagune", zones, furniture, hotspots, addons: MENU };
