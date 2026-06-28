import type { Venue, Zone, Furniture, Hotspot, AddOn } from "@beachclub/shared/types";

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
// Coordinates are % over aerial.jpg (Bali Finns style): thatched pavilions top,
// free-form pool with round platforms center, white-daybed lawn lower-left,
// beach & sea along the lower-right.
const furniture: Furniture[] = [
  // VIP Oceanfront (beach loungers near the sand & sea, lower-right)
  { id: "vo1", label: "Oceanfront 1", zoneId: "vip-oceanfront", type: "cabana", capacity: 6, priceChf: 480, x: 64, y: 70 },
  { id: "vo2", label: "Oceanfront 2", zoneId: "vip-oceanfront", type: "daybed", capacity: 4, priceChf: 290, x: 70, y: 76 },
  { id: "vo3", label: "Oceanfront 3", zoneId: "vip-oceanfront", type: "daybed", capacity: 4, priceChf: 290, x: 76, y: 82 },
  { id: "vo4", label: "Oceanfront 4", zoneId: "vip-oceanfront", type: "daybed", capacity: 4, priceChf: 290, x: 58, y: 70 },
  // Garden Party (white-daybed lawn, lower-left)
  { id: "gp1", label: "Garden 1", zoneId: "garden-party", type: "daybed", capacity: 4, priceChf: 210, x: 20, y: 72 },
  { id: "gp2", label: "Garden 2", zoneId: "garden-party", type: "daybed", capacity: 4, priceChf: 210, x: 26, y: 78 },
  { id: "gp3", label: "Garden 3", zoneId: "garden-party", type: "sunbed", capacity: 2, priceChf: 120, x: 16, y: 66 },
  { id: "gp4", label: "Garden 4", zoneId: "garden-party", type: "sunbed", capacity: 2, priceChf: 120, x: 30, y: 84 },
  // Beach Lagoon (around the central free-form lagoon)
  { id: "bl1", label: "Lagoon 1", zoneId: "beach-lagoon", type: "daybed", capacity: 4, priceChf: 240, x: 46, y: 36 },
  { id: "bl2", label: "Lagoon 2", zoneId: "beach-lagoon", type: "daybed", capacity: 4, priceChf: 240, x: 54, y: 44 },
  { id: "bl3", label: "Lagoon 3", zoneId: "beach-lagoon", type: "platform", capacity: 8, priceChf: 360, x: 44, y: 50 },
  { id: "bl4", label: "Lagoon 4", zoneId: "beach-lagoon", type: "sunbed", capacity: 2, priceChf: 130, x: 38, y: 44 },
  // Beach Pool (right part of the pool)
  { id: "bp1", label: "Pool 1", zoneId: "beach-pool", type: "daybed", capacity: 4, priceChf: 230, x: 66, y: 40 },
  { id: "bp2", label: "Pool 2", zoneId: "beach-pool", type: "daybed", capacity: 4, priceChf: 230, x: 70, y: 46 },
  { id: "bp3", label: "Pool 3", zoneId: "beach-pool", type: "platform", capacity: 8, priceChf: 350, x: 64, y: 34 },
  { id: "bp4", label: "Pool 4", zoneId: "beach-pool", type: "sunbed", capacity: 2, priceChf: 130, x: 72, y: 40 },
  // VIP Private Pool & Cabana (canopied cabanas, left edge)
  { id: "vp1", label: "Private Cabana 1", zoneId: "vip-private", type: "vip_cabana", capacity: 8, priceChf: 690, x: 10, y: 60 },
  { id: "vp2", label: "Private Cabana 2", zoneId: "vip-private", type: "vip_cabana", capacity: 8, priceChf: 690, x: 14, y: 68 },
  { id: "vp3", label: "Private Cabana 3", zoneId: "vip-private", type: "cabana", capacity: 6, priceChf: 460, x: 8, y: 54 },
  // Sunset (right side, towards the beach & sea)
  { id: "su1", label: "Sunset Cabana 1", zoneId: "sunset", type: "cabana", capacity: 6, priceChf: 420, x: 80, y: 48 },
  { id: "su2", label: "Sunset Lounge 2", zoneId: "sunset", type: "daybed", capacity: 4, priceChf: 250, x: 84, y: 56 },
  { id: "su3", label: "Sunset Lounge 3", zoneId: "sunset", type: "daybed", capacity: 4, priceChf: 250, x: 76, y: 52 },
  { id: "su4", label: "Surf Deck", zoneId: "sunset", type: "platform", capacity: 10, priceChf: 520, x: 88, y: 62 },
];

const hotspots: Hotspot[] = [
  // Entries & boutiques — along the TOP (thatched pavilions)
  { id: "h-priority-entry", label: "Priority Entry", kind: "entry", x: 30, y: 6 },
  { id: "h-main-entry", label: "Main Entry", kind: "entry", x: 60, y: 6 },
  { id: "h-priority-boutique", label: "Lagune Priority Boutique", kind: "boutique", x: 16, y: 16 },
  { id: "h-grand-boutique", label: "Lagune Grand Boutique", kind: "boutique", x: 84, y: 18 },
  // Restaurants
  { id: "h-monsoon", label: "Monsoon", kind: "restaurant", x: 28, y: 24 },
  { id: "h-beach-restaurant", label: "Beach Party Restaurant", kind: "restaurant", x: 62, y: 28, zoneId: "beach-pool" },
  // Bars
  { id: "h-gazebo", label: "Gazebo Bar", kind: "bar", x: 50, y: 42 },
  { id: "h-garden-bar", label: "Garden Party Bar", kind: "bar", x: 22, y: 62, zoneId: "garden-party" },
  { id: "h-long-bar", label: "Long Bar", kind: "bar", x: 10, y: 50 },
  { id: "h-flippas", label: "Flippas", kind: "bar", x: 82, y: 32, zoneId: "sunset" },
  { id: "h-ocean-bar", label: "Ocean Bar", kind: "bar", x: 74, y: 64, zoneId: "vip-oceanfront" },
  // Party / stage
  { id: "h-party-platforms", label: "Party Platforms", kind: "zone", x: 42, y: 48 },
  { id: "h-stage", label: "Stage", kind: "stage", x: 36, y: 34 },
  { id: "h-dance-floor", label: "Dance Floor", kind: "stage", x: 30, y: 70 },
  { id: "h-party-zone", label: "Party Zone", kind: "zone", x: 50, y: 64 },
  { id: "h-surf-deck", label: "Surf Deck", kind: "zone", x: 86, y: 70, zoneId: "sunset" },
  { id: "h-beach-access", label: "Beach Access", kind: "zone", x: 72, y: 86 },
];

// Add-ons: food, drinks and bottle service.
const addons: AddOn[] = [
  { id: "mojito", name: "Mojito", category: "cocktail", priceChf: 18 },
  { id: "spritz", name: "Aperol Spritz", category: "cocktail", priceChf: 16 },
  { id: "pina", name: "Piña Colada", category: "cocktail", priceChf: 19 },
  { id: "ceviche", name: "Ceviche de daurade", category: "food", priceChf: 24 },
  { id: "poke", name: "Poke bowl saumon", category: "food", priceChf: 22 },
  { id: "gambas", name: "Gambas grillées", category: "food", priceChf: 28 },
  { id: "fries", name: "Frites truffe", category: "food", priceChf: 12 },
  { id: "coco", name: "Noix de coco fraîche", category: "soft", priceChf: 9 },
  { id: "eau", name: "Eau pétillante", category: "soft", priceChf: 6 },
  { id: "champagne", name: "Bouteille Champagne brut", category: "bottle", priceChf: 220 },
  { id: "vodka", name: "Bouteille Vodka premium", category: "bottle", priceChf: 280 },
  { id: "rose", name: "Magnum rosé", category: "bottle", priceChf: 180 },
];

export const VENUE: Venue = { name: "Lagune", zones, furniture, hotspots, addons };
