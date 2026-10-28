import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addBasketItem,
  clearBasket,
  getBasket,
  removeBasketItem,
  updateBasketItemQuantity,
} from "../lib/basket/client";

const mockBasket = {
  id: "session-1",
  subtotal: 2598,
  items: [
    {
      id: "item-1",
      quantity: 2,
      lineTotal: 2598,
      product: {
        id: "1",
        name: "Energy saving light bulb",
        subtitle: "25W // Packet of 4",
        price: 1299,
        imgUrl: "https://example.com/bulb.png",
      },
    },
  ],
};

function mockFetchOnce(dataKey: string) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: { [dataKey]: mockBasket } }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("basket client", () => {
  it("getBasket posts to the basket server with credentials included", async () => {
    const fetchMock = mockFetchOnce("basket");

    const basket = await getBasket();

    expect(basket).toEqual(mockBasket);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3002/graphql");
    expect(init.credentials).toBe("include");
  });

  it("addBasketItem sends productId and quantity as variables", async () => {
    const fetchMock = mockFetchOnce("addBasketItem");

    await addBasketItem("1", 2);

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body).variables).toEqual({ productId: "1", quantity: 2 });
  });

  it("updateBasketItemQuantity sends itemId and quantity as variables", async () => {
    const fetchMock = mockFetchOnce("updateBasketItemQuantity");

    await updateBasketItemQuantity("item-1", 5);

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body).variables).toEqual({ itemId: "item-1", quantity: 5 });
  });

  it("removeBasketItem sends itemId as a variable", async () => {
    const fetchMock = mockFetchOnce("removeBasketItem");

    await removeBasketItem("item-1");

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body).variables).toEqual({ itemId: "item-1" });
  });

  it("clearBasket sends no variables", async () => {
    const fetchMock = mockFetchOnce("clearBasket");

    await clearBasket();

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body).variables).toBeUndefined();
  });

  it("propagates GraphQL errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ errors: [{ message: "quantity must be a whole number between 1 and 99" }] }),
      }),
    );

    await expect(addBasketItem("1", 0)).rejects.toThrow("between 1 and 99");
  });
});
