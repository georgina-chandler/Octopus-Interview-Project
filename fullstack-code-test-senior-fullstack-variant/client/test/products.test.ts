import { afterEach, describe, expect, it, vi } from "vitest";
import { getProduct } from "../lib/graphql/products";

const mockProduct = {
  id: "1",
  name: "Energy saving light bulb",
  subtitle: "25W // Packet of 4",
  description: "A great bulb",
  price: 1299,
  brand: "Philips",
  weight: 77,
  height: 12.6,
  width: 6.2,
  length: 6.2,
  model_code: "E27 ES",
  colour: "Cool daylight",
  img_url: "https://example.com/bulb.png",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getProduct", () => {
  it("posts a GraphQL query and returns the product", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { Product: mockProduct } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const product = await getProduct("1");

    expect(product).toEqual(mockProduct);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/graphql");
    expect(JSON.parse(init.body).variables).toEqual({ id: "1" });
  });

  it("returns null when the product does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { Product: null } }),
      }),
    );

    const product = await getProduct("missing");

    expect(product).toBeNull();
  });

  it("throws when the GraphQL response contains errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ errors: [{ message: "boom" }] }),
      }),
    );

    await expect(getProduct("1")).rejects.toThrow("boom");
  });

  it("throws when the HTTP response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(getProduct("1")).rejects.toThrow("500");
  });
});
