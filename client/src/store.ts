import { create } from "zustand";
import type { CartLine, MenuItem, Order, WsEvent } from "@beachclub/shared/types";

interface State {
  reservedIds: Set<string>;
  cart: CartLine[];
  orders: Order[];
  setReserved: (ids: string[]) => void;
  setOrders: (orders: Order[]) => void;
  addLine: (item: MenuItem, qty?: number) => void;
  removeLine: (itemId: string) => void;
  setCart: (cart: CartLine[]) => void;
  clearCart: () => void;
  applyWsEvent: (e: WsEvent) => void;
}

export const useStore = create<State>((set) => ({
  reservedIds: new Set<string>(),
  cart: [],
  orders: [],
  setReserved: (ids) => set({ reservedIds: new Set(ids) }),
  setOrders: (orders) => set({ orders }),
  addLine: (item, qty = 1) =>
    set((s) => {
      const i = s.cart.findIndex((l) => l.itemId === item.id);
      const cart =
        i >= 0
          ? s.cart.map((l, k) => (k === i ? { ...l, qty: l.qty + qty } : l))
          : [...s.cart, { itemId: item.id, name: item.name, qty, priceChf: item.priceChf }];
      return { cart };
    }),
  removeLine: (itemId) => set((s) => ({ cart: s.cart.filter((l) => l.itemId !== itemId) })),
  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: [] }),
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
}));

export const cartTotal = (cart: CartLine[]): number =>
  cart.reduce((t, l) => t + l.qty * l.priceChf, 0);
