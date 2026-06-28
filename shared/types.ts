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
