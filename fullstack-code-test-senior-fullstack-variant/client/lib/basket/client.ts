import { fetchGraphQL } from "../graphql/client";
import type { Basket } from "./types";

// The basket is its own standalone server (see server/basket-server.js),
// not part of the Next app, so this is cross-origin from the browser's
// point of view — it needs an absolute URL and `credentials: "include"` so
// the session cookie is sent and the Set-Cookie response is honoured.
const BASKET_ENDPOINT =
  process.env.NEXT_PUBLIC_BASKET_GRAPHQL_ENDPOINT ?? "http://localhost:3002/graphql";
const REQUEST_INIT: RequestInit = { credentials: "include" };

const BASKET_FIELDS = `
  id
  subtotal
  items {
    id
    quantity
    lineTotal
    product {
      id
      name
      subtitle
      price
      imgUrl
    }
  }
`;

const BASKET_QUERY = `query Basket { basket { ${BASKET_FIELDS} } }`;

const ADD_BASKET_ITEM_MUTATION = `
  mutation AddBasketItem($productId: ID!, $quantity: Int!) {
    addBasketItem(productId: $productId, quantity: $quantity) { ${BASKET_FIELDS} }
  }
`;

const UPDATE_BASKET_ITEM_QUANTITY_MUTATION = `
  mutation UpdateBasketItemQuantity($itemId: ID!, $quantity: Int!) {
    updateBasketItemQuantity(itemId: $itemId, quantity: $quantity) { ${BASKET_FIELDS} }
  }
`;

const REMOVE_BASKET_ITEM_MUTATION = `
  mutation RemoveBasketItem($itemId: ID!) {
    removeBasketItem(itemId: $itemId) { ${BASKET_FIELDS} }
  }
`;

const CLEAR_BASKET_MUTATION = `
  mutation ClearBasket {
    clearBasket { ${BASKET_FIELDS} }
  }
`;

export async function getBasket(): Promise<Basket> {
  const data = await fetchGraphQL<{ basket: Basket }>(
    BASKET_ENDPOINT,
    BASKET_QUERY,
    undefined,
    REQUEST_INIT,
  );
  return data.basket;
}

export async function addBasketItem(productId: string, quantity: number): Promise<Basket> {
  const data = await fetchGraphQL<{ addBasketItem: Basket }>(
    BASKET_ENDPOINT,
    ADD_BASKET_ITEM_MUTATION,
    { productId, quantity },
    REQUEST_INIT,
  );
  return data.addBasketItem;
}

export async function updateBasketItemQuantity(
  itemId: string,
  quantity: number,
): Promise<Basket> {
  const data = await fetchGraphQL<{ updateBasketItemQuantity: Basket }>(
    BASKET_ENDPOINT,
    UPDATE_BASKET_ITEM_QUANTITY_MUTATION,
    { itemId, quantity },
    REQUEST_INIT,
  );
  return data.updateBasketItemQuantity;
}

export async function removeBasketItem(itemId: string): Promise<Basket> {
  const data = await fetchGraphQL<{ removeBasketItem: Basket }>(
    BASKET_ENDPOINT,
    REMOVE_BASKET_ITEM_MUTATION,
    { itemId },
    REQUEST_INIT,
  );
  return data.removeBasketItem;
}

export async function clearBasket(): Promise<Basket> {
  const data = await fetchGraphQL<{ clearBasket: Basket }>(
    BASKET_ENDPOINT,
    CLEAR_BASKET_MUTATION,
    undefined,
    REQUEST_INIT,
  );
  return data.clearBasket;
}
