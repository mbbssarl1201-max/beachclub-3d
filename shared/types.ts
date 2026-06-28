export type DaybedType = "daybed" | "cabana" | "sunbed";

export interface Daybed {
  id: string;
  label: string;
  type: DaybedType;
  x: number;
  z: number;
  capacity: number;
}

export type MenuCategory = "cocktail" | "food" | "soft";

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  priceChf: number;
}

export interface CartLine {
  itemId: string;
  name: string;
  qty: number;
  priceChf: number;
}

export type OrderStatus = "new" | "preparing" | "ready";

export interface Order {
  id: string;
  daybedId: string;
  lines: CartLine[];
  totalChf: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Reservation {
  id: string;
  daybedId: string;
  name: string;
  createdAt: string;
}

export type WsEvent =
  | { type: "reservation"; daybedId: string }
  | { type: "order"; order: Order };

// --- Venue (aerial map + booking) ---

export type FurnitureType = "daybed" | "cabana" | "vip_cabana" | "sunbed" | "platform";

export interface Zone {
  id: string;
  name: string;
  blurb: string;
}

/** A bookable furniture unit. `id` doubles as the reservation daybedId. */
export interface Furniture {
  id: string;
  label: string;
  zoneId: string;
  type: FurnitureType;
  capacity: number;
  priceChf: number;
  /** Position over the aerial image, in percent (0–100). */
  x: number;
  y: number;
}

export type HotspotKind =
  | "entry"
  | "bar"
  | "restaurant"
  | "pool"
  | "boutique"
  | "stage"
  | "zone";

/** A non-bookable point of interest shown as a pin on the aerial map. */
export interface Hotspot {
  id: string;
  label: string;
  kind: HotspotKind;
  x: number;
  y: number;
  zoneId?: string;
}

export interface AddOn {
  id: string;
  name: string;
  category: "food" | "cocktail" | "soft" | "bottle";
  priceChf: number;
}

export interface Venue {
  name: string;
  zones: Zone[];
  furniture: Furniture[];
  hotspots: Hotspot[];
  addons: AddOn[];
}

export type Session = "day" | "sunset";

export interface BookingDraft {
  date: string | null;
  session: Session | null;
  furnitureId: string | null;
  name: string;
  addons: CartLine[];
}
