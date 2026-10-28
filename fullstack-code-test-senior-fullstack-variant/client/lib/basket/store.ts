import { randomUUID } from "crypto";
import type { BasketProduct } from "./types";

// Stored shape omits the computed fields (lineTotal/subtotal) — those are
// derived by the GraphQL resolvers from price * quantity, never persisted,
// so they can never drift from the current item quantities.
export interface StoredBasketItem {
  id: string;
  product: BasketProduct;
  quantity: number;
}

export interface StoredBasket {
  id: string;
  items: StoredBasketItem[];
}

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

// In-memory, per-process, keyed by session id. This is fine for a single
// dev server but does not survive a restart and would not be shared across
// instances of a horizontally-scaled or serverless deployment — a real
// deployment would back this with Redis (or similar), keyed the same way,
// with a TTL for abandoned baskets. See the README for more detail.
const baskets = new Map<string, StoredBasket>();

export function getOrCreateBasket(sessionId: string): StoredBasket {
  let basket = baskets.get(sessionId);
  if (!basket) {
    basket = { id: sessionId, items: [] };
    baskets.set(sessionId, basket);
  }
  return basket;
}

export function addItem(
  sessionId: string,
  product: BasketProduct,
  quantity: number,
): StoredBasket {
  const basket = getOrCreateBasket(sessionId);
  const existing = basket.items.find((item) => item.product.id === product.id);

  if (existing) {
    existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
  } else {
    basket.items.push({ id: randomUUID(), product, quantity });
  }

  return basket;
}

export function updateItemQuantity(
  sessionId: string,
  itemId: string,
  quantity: number,
): StoredBasket | null {
  const basket = getOrCreateBasket(sessionId);
  const item = basket.items.find((item) => item.id === itemId);

  if (!item) {
    return null;
  }

  item.quantity = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity));
  return basket;
}

export function removeItem(sessionId: string, itemId: string): StoredBasket {
  const basket = getOrCreateBasket(sessionId);
  basket.items = basket.items.filter((item) => item.id !== itemId);
  return basket;
}

export function clearBasket(sessionId: string): StoredBasket {
  const basket = getOrCreateBasket(sessionId);
  basket.items = [];
  return basket;
}
