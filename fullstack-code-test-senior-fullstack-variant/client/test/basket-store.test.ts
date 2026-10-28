import { beforeEach, describe, expect, it } from "vitest";
import * as store from "../lib/basket/store";
import type { BasketProduct } from "../lib/basket/types";

const bulb: BasketProduct = {
  id: "1",
  name: "Energy saving light bulb",
  subtitle: "25W // Packet of 4",
  price: 1299,
  imgUrl: "https://example.com/bulb.png",
};

const candle: BasketProduct = {
  id: "2",
  name: "Scented candle",
  subtitle: "Lavender // Single",
  price: 599,
  imgUrl: "https://example.com/candle.png",
};

const SESSION_A = "session-a";
const SESSION_B = "session-b";

describe("basket store", () => {
  beforeEach(() => {
    store.clearBasket(SESSION_A);
    store.clearBasket(SESSION_B);
  });

  it("creates an empty basket for a session that has never been seen", () => {
    const basket = store.getOrCreateBasket("brand-new-session");
    expect(basket.items).toEqual([]);
  });

  it("adds a new item", () => {
    const basket = store.addItem(SESSION_A, bulb, 2);
    expect(basket.items).toHaveLength(1);
    expect(basket.items[0]).toMatchObject({ product: bulb, quantity: 2 });
  });

  it("merges a repeated add of the same product instead of duplicating it", () => {
    store.addItem(SESSION_A, bulb, 2);
    const basket = store.addItem(SESSION_A, bulb, 3);

    expect(basket.items).toHaveLength(1);
    expect(basket.items[0].quantity).toBe(5);
  });

  it("caps merged quantity at the per-item maximum", () => {
    store.addItem(SESSION_A, bulb, 90);
    const basket = store.addItem(SESSION_A, bulb, 50);

    expect(basket.items[0].quantity).toBe(99);
  });

  it("keeps separate products as separate lines", () => {
    store.addItem(SESSION_A, bulb, 1);
    const basket = store.addItem(SESSION_A, candle, 1);

    expect(basket.items).toHaveLength(2);
  });

  it("updates an existing item's quantity", () => {
    const added = store.addItem(SESSION_A, bulb, 1);
    const updated = store.updateItemQuantity(SESSION_A, added.items[0].id, 7);

    expect(updated?.items[0].quantity).toBe(7);
  });

  it("clamps an out-of-range quantity on update", () => {
    const added = store.addItem(SESSION_A, bulb, 1);
    const updated = store.updateItemQuantity(SESSION_A, added.items[0].id, 500);

    expect(updated?.items[0].quantity).toBe(99);
  });

  it("returns null when updating a quantity for an item that doesn't exist", () => {
    expect(store.updateItemQuantity(SESSION_A, "missing-item", 2)).toBeNull();
  });

  it("removes an item", () => {
    const added = store.addItem(SESSION_A, bulb, 1);
    const basket = store.removeItem(SESSION_A, added.items[0].id);

    expect(basket.items).toEqual([]);
  });

  it("removing an unknown item id is a no-op", () => {
    store.addItem(SESSION_A, bulb, 1);
    const basket = store.removeItem(SESSION_A, "missing-item");

    expect(basket.items).toHaveLength(1);
  });

  it("clears every item in the basket", () => {
    store.addItem(SESSION_A, bulb, 1);
    store.addItem(SESSION_A, candle, 1);

    expect(store.clearBasket(SESSION_A).items).toEqual([]);
  });

  it("keeps different sessions' baskets isolated from one another", () => {
    store.addItem(SESSION_A, bulb, 1);
    const basketB = store.getOrCreateBasket(SESSION_B);

    expect(basketB.items).toEqual([]);
  });
});
