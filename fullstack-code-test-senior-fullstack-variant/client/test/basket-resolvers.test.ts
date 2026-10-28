import { createSchema, createYoga } from "graphql-yoga";
import { describe, expect, it, vi } from "vitest";
import { resolvers } from "../lib/basket/resolvers";
import { typeDefs } from "../lib/basket/schema";

const mockBulb = {
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

vi.mock("../lib/graphql/products", () => ({
  getProduct: vi.fn(async (id: string) => (id === "1" ? mockBulb : null)),
}));

// A separate Yoga instance from the production route handler's: same schema
// and resolvers (the thing under test), but a context factory that reads
// the session id straight off a header instead of a Next.js cookie, since
// next/headers' cookies() only works inside an actual Next request scope.
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context: async ({ request }: { request: Request }) => ({
    sessionId: request.headers.get("x-test-session") ?? "default",
  }),
  // Matches the production route handler — see the comment there.
  maskedErrors: false,
});

interface GraphQLResult {
  data?: Record<string, unknown>;
  errors?: { message: string }[];
}

async function execute(
  query: string,
  variables: Record<string, unknown> | undefined,
  sessionId: string,
): Promise<GraphQLResult> {
  const response = await yoga.fetch("http://yoga.test/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-test-session": sessionId },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

let sessionCounter = 0;
function freshSessionId() {
  sessionCounter += 1;
  return `session-${sessionCounter}`;
}

const BASKET_QUERY = `
  query { basket { id subtotal items { id quantity lineTotal product { id name price imgUrl } } } }
`;

const ADD_ITEM = `
  mutation($productId: ID!, $quantity: Int!) {
    addBasketItem(productId: $productId, quantity: $quantity) {
      subtotal
      items { id quantity lineTotal product { id } }
    }
  }
`;

describe("basket resolvers", () => {
  it("starts empty for a new session", async () => {
    const result = await execute(BASKET_QUERY, undefined, freshSessionId());
    expect(result.errors).toBeUndefined();
    expect(result.data?.basket).toMatchObject({ items: [], subtotal: 0 });
  });

  it("adds an item and computes lineTotal/subtotal from the catalogue price", async () => {
    const session = freshSessionId();
    const result = await execute(ADD_ITEM, { productId: "1", quantity: 2 }, session);

    expect(result.errors).toBeUndefined();
    expect(result.data?.addBasketItem).toMatchObject({
      subtotal: 2598,
      items: [{ quantity: 2, lineTotal: 2598 }],
    });
  });

  it("merges a second add of the same product into one line", async () => {
    const session = freshSessionId();
    await execute(ADD_ITEM, { productId: "1", quantity: 2 }, session);
    const result = await execute(ADD_ITEM, { productId: "1", quantity: 1 }, session);

    const basket = result.data?.addBasketItem as { items: { quantity: number }[] };
    expect(basket.items).toHaveLength(1);
    expect(basket.items[0].quantity).toBe(3);
  });

  it("rejects a quantity of zero", async () => {
    const result = await execute(ADD_ITEM, { productId: "1", quantity: 0 }, freshSessionId());
    expect(result.errors?.[0].message).toMatch(/between 1 and 99/);
  });

  it("rejects an unknown product id", async () => {
    const result = await execute(ADD_ITEM, { productId: "404", quantity: 1 }, freshSessionId());
    expect(result.errors?.[0].message).toBe("Product not found");
  });

  it("updates an item's quantity", async () => {
    const session = freshSessionId();
    const added = await execute(ADD_ITEM, { productId: "1", quantity: 1 }, session);
    const itemId = (added.data?.addBasketItem as { items: { id: string }[] }).items[0].id;

    const result = await execute(
      `mutation($itemId: ID!, $quantity: Int!) { updateBasketItemQuantity(itemId: $itemId, quantity: $quantity) { items { quantity } } }`,
      { itemId, quantity: 5 },
      session,
    );

    expect(result.errors).toBeUndefined();
    const basket = result.data?.updateBasketItemQuantity as { items: { quantity: number }[] };
    expect(basket.items[0].quantity).toBe(5);
  });

  it("errors when updating a quantity for an item that doesn't exist", async () => {
    const result = await execute(
      `mutation { updateBasketItemQuantity(itemId: "missing", quantity: 1) { id } }`,
      undefined,
      freshSessionId(),
    );
    expect(result.errors?.[0].message).toBe("Basket item not found");
  });

  it("removes an item", async () => {
    const session = freshSessionId();
    const added = await execute(ADD_ITEM, { productId: "1", quantity: 1 }, session);
    const itemId = (added.data?.addBasketItem as { items: { id: string }[] }).items[0].id;

    const result = await execute(
      `mutation($itemId: ID!) { removeBasketItem(itemId: $itemId) { items { id } } }`,
      { itemId },
      session,
    );

    expect((result.data?.removeBasketItem as { items: unknown[] }).items).toEqual([]);
  });

  it("clears the basket", async () => {
    const session = freshSessionId();
    await execute(ADD_ITEM, { productId: "1", quantity: 1 }, session);

    const result = await execute(
      `mutation { clearBasket { items { id } subtotal } }`,
      undefined,
      session,
    );

    expect(result.data?.clearBasket).toMatchObject({ items: [], subtotal: 0 });
  });

  it("keeps two sessions' baskets isolated", async () => {
    const sessionA = freshSessionId();
    const sessionB = freshSessionId();
    await execute(ADD_ITEM, { productId: "1", quantity: 1 }, sessionA);

    const result = await execute(BASKET_QUERY, undefined, sessionB);
    expect(result.data?.basket).toMatchObject({ items: [] });
  });
});
