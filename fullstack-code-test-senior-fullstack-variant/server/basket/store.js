const { randomUUID } = require("crypto");

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

// In-memory, per-process, keyed by session id. Stored items omit the
// computed fields (lineTotal/subtotal) — those are derived by the GraphQL
// resolvers from price * quantity, never persisted, so they can never drift
// from the current item quantities.
//
// This is enough to demo the full flow and exercise the schema, but it
// resets on every server restart and wouldn't be shared across instances of
// a horizontally-scaled or serverless deployment. A real deployment would
// back this with Redis (or similar), keyed the same way, with a TTL for
// abandoned baskets, without the resolvers needing to change.
const baskets = new Map();

function getOrCreateBasket(sessionId) {
  let basket = baskets.get(sessionId);
  if (!basket) {
    basket = { id: sessionId, items: [] };
    baskets.set(sessionId, basket);
  }
  return basket;
}

function addItem(sessionId, product, quantity) {
  const basket = getOrCreateBasket(sessionId);
  const existing = basket.items.find((item) => item.product.id === product.id);

  if (existing) {
    existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
  } else {
    basket.items.push({ id: randomUUID(), product, quantity });
  }

  return basket;
}

function updateItemQuantity(sessionId, itemId, quantity) {
  const basket = getOrCreateBasket(sessionId);
  const item = basket.items.find((item) => item.id === itemId);

  if (!item) {
    return null;
  }

  item.quantity = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity));
  return basket;
}

function removeItem(sessionId, itemId) {
  const basket = getOrCreateBasket(sessionId);
  basket.items = basket.items.filter((item) => item.id !== itemId);
  return basket;
}

function clearBasket(sessionId) {
  const basket = getOrCreateBasket(sessionId);
  basket.items = [];
  return basket;
}

module.exports = {
  getOrCreateBasket,
  addItem,
  updateItemQuantity,
  removeItem,
  clearBasket,
};
