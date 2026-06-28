import type { MenuItem, CartLine } from "@beachclub/shared/types";

export function addItem(cart: CartLine[], item: MenuItem, qty = 1): CartLine[] {
  const i = cart.findIndex((l) => l.itemId === item.id);
  if (i >= 0) return cart.map((l, k) => (k === i ? { ...l, qty: l.qty + qty } : l));
  return [...cart, { itemId: item.id, name: item.name, qty, priceChf: item.priceChf }];
}

export function removeItem(cart: CartLine[], itemId: string): CartLine[] {
  return cart.filter((l) => l.itemId !== itemId);
}

export function cartTotal(cart: CartLine[]): number {
  return cart.reduce((s, l) => s + l.qty * l.priceChf, 0);
}
