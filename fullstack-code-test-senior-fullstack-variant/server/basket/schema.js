const typeDefs = /* GraphQL */ `
  """
  A snapshot of the catalogue fields needed to render a basket item. Price
  is captured at add-time, not looked up live on every basket read — see
  the README for the trade-off.
  """
  type BasketProduct {
    id: ID!
    name: String!
    subtitle: String!
    "Pence"
    price: Int!
    imgUrl: String!
  }

  type BasketItem {
    id: ID!
    product: BasketProduct!
    quantity: Int!
    "Pence: quantity * product.price, always server-computed"
    lineTotal: Int!
  }

  type Basket {
    id: ID!
    items: [BasketItem!]!
    "Pence: sum of every item's lineTotal, always server-computed"
    subtotal: Int!
  }

  type Query {
    "The current caller's basket, resolved from their session — never by id."
    basket: Basket!
  }

  type Mutation {
    """
    Adds quantity units of productId to the basket, merging into an
    existing line for that product if one is already present (capped at the
    per-item quantity limit). productId is validated server-side against
    the product catalogue; price is never accepted from the client.
    """
    addBasketItem(productId: ID!, quantity: Int = 1): Basket!

    "Sets an existing item's quantity outright. Use removeBasketItem to remove an item."
    updateBasketItemQuantity(itemId: ID!, quantity: Int!): Basket!

    removeBasketItem(itemId: ID!): Basket!

    clearBasket: Basket!
  }
`;

module.exports = { typeDefs };
