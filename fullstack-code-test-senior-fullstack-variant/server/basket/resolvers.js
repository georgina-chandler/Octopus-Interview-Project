const { requireFromClient } = require("../require-from-client");
const { GraphQLError } = requireFromClient("graphql");
const { getProduct } = require("./products");
const store = require("./store");

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

function assertValidQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
    throw new GraphQLError(
      `quantity must be a whole number between ${MIN_QUANTITY} and ${MAX_QUANTITY}`,
      { extensions: { code: "BAD_USER_INPUT" } },
    );
  }
}

const resolvers = {
  Basket: {
    subtotal: (basket) =>
      basket.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  },
  BasketItem: {
    lineTotal: (item) => item.product.price * item.quantity,
  },
  Query: {
    basket: (_parent, _args, context) => store.getOrCreateBasket(context.sessionId),
  },
  Mutation: {
    addBasketItem: async (_parent, args, context) => {
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
    updateBasketItemQuantity: (_parent, args, context) => {
      assertValidQuantity(args.quantity);

      const basket = store.updateItemQuantity(context.sessionId, args.itemId, args.quantity);
      if (!basket) {
        throw new GraphQLError("Basket item not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return basket;
    },
    removeBasketItem: (_parent, args, context) => store.removeItem(context.sessionId, args.itemId),
    clearBasket: (_parent, _args, context) => store.clearBasket(context.sessionId),
  },
};

module.exports = { resolvers };
