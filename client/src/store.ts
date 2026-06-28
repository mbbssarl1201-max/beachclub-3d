import { create } from "zustand";
import type {
  CartLine,
  MenuItem,
  Order,
  WsEvent,
  Venue,
  AddOn,
  Session,
} from "@beachclub/shared/types";

export type Step = 0 | 1 | 2 | 3 | 4; // date, furniture, addons, review, confirm

interface State {
  // live / shared
  reservedIds: Set<string>;
  orders: Order[];
  cart: CartLine[]; // legacy per-daybed ordering (voice/chat)
  // venue
  venue: Venue | null;
  setVenue: (v: Venue) => void;
  // booking draft
  step: Step;
  date: string | null;
  session: Session | null;
  furnitureId: string | null;
  guestName: string;
  addons: CartLine[];
  promo: string | null;
  // actions
  setReserved: (ids: string[]) => void;
  setOrders: (orders: Order[]) => void;
  applyWsEvent: (e: WsEvent) => void;
  setStep: (s: Step) => void;
  setDate: (d: string) => void;
  setSession: (s: Session) => void;
  selectFurniture: (id: string) => void;
  setGuestName: (n: string) => void;
  addAddon: (a: AddOn, qty?: number) => void;
  removeAddon: (id: string) => void;
  applyPromo: (code: string) => void;
  resetBooking: () => void;
  // legacy cart
  addLine: (item: MenuItem, qty?: number) => void;
  removeLine: (itemId: string) => void;
  setCart: (cart: CartLine[]) => void;
  clearCart: () => void;
}

const addToLines = (lines: CartLine[], id: string, name: string, priceChf: number, qty: number): CartLine[] => {
  const i = lines.findIndex((l) => l.itemId === id);
  if (i >= 0) return lines.map((l, k) => (k === i ? { ...l, qty: l.qty + qty } : l));
  return [...lines, { itemId: id, name, qty, priceChf }];
};

export const useStore = create<State>((set) => ({
  reservedIds: new Set<string>(),
  orders: [],
  cart: [],
  venue: null,
  setVenue: (v) => set({ venue: v }),

  step: 0,
  date: null,
  session: null,
  furnitureId: null,
  guestName: "",
  addons: [],
  promo: null,

  setReserved: (ids) => set({ reservedIds: new Set(ids) }),
  setOrders: (orders) => set({ orders }),
  applyWsEvent: (e) =>
    set((s) => {
      if (e.type === "reservation") {
        const reservedIds = new Set(s.reservedIds);
        reservedIds.add(e.daybedId);
        return { reservedIds };
      }
      if (e.type === "order") {
        return { orders: [e.order, ...s.orders.filter((o) => o.id !== e.order.id)] };
      }
      return s;
    }),

  setStep: (step) => set({ step }),
  setDate: (date) => set({ date }),
  setSession: (session) => set({ session }),
  selectFurniture: (furnitureId) => set({ furnitureId }),
  setGuestName: (guestName) => set({ guestName }),
  addAddon: (a, qty = 1) =>
    set((s) => ({ addons: addToLines(s.addons, a.id, a.name, a.priceChf, qty) })),
  removeAddon: (id) => set((s) => ({ addons: s.addons.filter((l) => l.itemId !== id) })),
  applyPromo: (code) => set({ promo: code.trim().toUpperCase() || null }),
  resetBooking: () =>
    set({ step: 0, date: null, session: null, furnitureId: null, guestName: "", addons: [], promo: null }),

  addLine: (item, qty = 1) =>
    set((s) => ({ cart: addToLines(s.cart, item.id, item.name, item.priceChf, qty) })),
  removeLine: (itemId) => set((s) => ({ cart: s.cart.filter((l) => l.itemId !== itemId) })),
  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: [] }),
}));

export const linesTotal = (lines: CartLine[]): number =>
  lines.reduce((t, l) => t + l.qty * l.priceChf, 0);

// Promo codes (POC): SUNSET = -15%, LAGUNE10 = -10%.
export const promoDiscount = (code: string | null, subtotal: number): number => {
  if (code === "SUNSET") return Math.round(subtotal * 0.15);
  if (code === "LAGUNE10") return Math.round(subtotal * 0.1);
  return 0;
};
