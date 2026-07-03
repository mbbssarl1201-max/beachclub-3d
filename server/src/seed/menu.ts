import type { MenuItem } from "@beachclub/shared/types";

// Fictional menu for "Lagune" beach club. Prices in CHF.
// Single source of truth: the agent (voice/chat), the tap-to-order grid and the
// booking wizard add-ons all read this list (venue.addons === MENU).
export const MENU: MenuItem[] = [
  // Cocktails
  { id: "mojito", name: "Mojito", category: "cocktail", priceChf: 18 },
  { id: "spritz", name: "Aperol Spritz", category: "cocktail", priceChf: 16 },
  { id: "pina", name: "Piña Colada", category: "cocktail", priceChf: 19 },
  { id: "margarita", name: "Margarita", category: "cocktail", priceChf: 18 },
  { id: "negroni", name: "Negroni", category: "cocktail", priceChf: 20 },
  // Food
  { id: "ceviche", name: "Ceviche de daurade", category: "food", priceChf: 24 },
  { id: "poke", name: "Poke bowl saumon", category: "food", priceChf: 22 },
  { id: "burrata", name: "Burrata & tomates", category: "food", priceChf: 19 },
  { id: "gambas", name: "Gambas grillées", category: "food", priceChf: 28 },
  { id: "fries", name: "Frites truffe", category: "food", priceChf: 12 },
  // Softs
  { id: "coco", name: "Noix de coco fraîche", category: "soft", priceChf: 9 },
  { id: "limonade", name: "Limonade maison", category: "soft", priceChf: 8 },
  { id: "eau", name: "Eau pétillante", category: "soft", priceChf: 6 },
  // Bottle service
  { id: "champagne", name: "Bouteille Champagne brut", category: "bottle", priceChf: 220 },
  { id: "vodka", name: "Bouteille Vodka premium", category: "bottle", priceChf: 280 },
  { id: "rose", name: "Magnum rosé", category: "bottle", priceChf: 180 },
];
