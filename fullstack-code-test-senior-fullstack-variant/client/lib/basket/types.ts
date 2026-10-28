// Shared between the server (resolvers/store) and the browser (basket
// client) since both sides agree on the same GraphQL-shaped data. Prices are
// in pence throughout, consistent with the product catalogue.

export interface BasketProduct {
  id: string;
  name: string;
  subtitle: string;
  /** Pence, captured from the catalogue at the moment the item was added. */
  price: number;
  imgUrl: string;
}

export interface BasketItem {
  id: string;
  product: BasketProduct;
  quantity: number;
  /** Pence: quantity * product.price */
  lineTotal: number;
}

export interface Basket {
  id: string;
  items: BasketItem[];
  /** Pence: sum of every item's lineTotal */
  subtotal: number;
}
