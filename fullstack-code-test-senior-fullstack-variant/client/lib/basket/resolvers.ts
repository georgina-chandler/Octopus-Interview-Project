import { GraphQLError } from "graphql";
import { getProduct } from "../graphql/products";
import * as store from "./store";
import type { StoredBasket, StoredBasketItem } from "./store";

export interface BasketContext {
  sessionId: string;
}

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

function assertValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
    throw new GraphQLError(
      `quantity must be a whole number between ${MIN_QUANTITY} and ${MAX_QUANTITY}`,
      { extensions: { code: "BAD_USER_INPUT" } },
    );
  }
}

export const resolvers = {
  Basket: {
    subtotal: (basket: StoredBasket) =>
      basket.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  },
  BasketItem: {
    lineTotal: (item: StoredBasketItem) => item.product.price * item.quantity,
  },
  Query: {
    basket: (_parent: unknown, _args: unknown, context: BasketContext) =>
      store.getOrCreateBasket(context.sessionId),
  },
  Mutation: {
    addBasketItem: async (
      _parent: unknown,
      args: { productId: string; quantity: number },
      context: BasketContext,
    ) => {
      assertValidQuantity(args.quantity);

      // The client sends only a productId and a quantity — price always
      // comes from the catalogue, never from the caller.
      const product = await getProduct(args.productId);
      if (!product) {
        throw new GraphQLError("Product not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return store.addItem(
        context.sessionId,
        {
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          price: product.price,
          imgUrl: product.img_url,
        },
        args.quantity,
      );
    },
    updateBasketItemQuantity: (
      _parent: unknown,
      args: { itemId: string; quantity: number },
      context: BasketContext,
    ) => {
      assertValidQuantity(args.quantity);

      const basket = store.updateItemQuantity(context.sessionId, args.itemId, args.quantity);
      if (!basket) {
        throw new GraphQLError("Basket item not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return basket;
    },
    removeBasketItem: (
      _parent: unknown,
      args: { itemId: string },
      context: BasketContext,
    ) => store.removeItem(context.sessionId, args.itemId),
    clearBasket: (_parent: unknown, _args: unknown, context: BasketContext) =>
      store.clearBasket(context.sessionId),
  },
};
