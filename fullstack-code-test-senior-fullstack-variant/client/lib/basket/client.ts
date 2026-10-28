import { fetchGraphQL } from "../graphql/client";
import type { Basket } from "./types";

// Relative path: this endpoint is served by the Next app itself (see
// app/api/graphql/route.ts), so it's always same-origin and the session
// cookie is sent automatically — no base URL or credentials option needed.
const BASKET_ENDPOINT = "/api/graphql";

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
  const data = await fetchGraphQL<{ basket: Basket }>(BASKET_ENDPOINT, BASKET_QUERY);
  return data.basket;
}

export async function addBasketItem(productId: string, quantity: number): Promise<Basket> {
  const data = await fetchGraphQL<{ addBasketItem: Basket }>(
    BASKET_ENDPOINT,
    ADD_BASKET_ITEM_MUTATION,
    { productId, quantity },
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
  );
  return data.updateBasketItemQuantity;
}

export async function removeBasketItem(itemId: string): Promise<Basket> {
  const data = await fetchGraphQL<{ removeBasketItem: Basket }>(
    BASKET_ENDPOINT,
    REMOVE_BASKET_ITEM_MUTATION,
    { itemId },
  );
  return data.removeBasketItem;
}

export async function clearBasket(): Promise<Basket> {
  const data = await fetchGraphQL<{ clearBasket: Basket }>(
    BASKET_ENDPOINT,
    CLEAR_BASKET_MUTATION,
  );
  return data.clearBasket;
}
