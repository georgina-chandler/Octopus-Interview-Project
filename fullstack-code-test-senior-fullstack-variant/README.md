<img src="https://static.octopuscdn.com/constantine/constantine.svg" alt="Octopus Energy mascot, Constantine" width="100" />

# Octopus Energy Frontend code test

In this code test, you'll be asked to:

- Make a React application that follows the design in `design.jpg` and consumes the API. Even though the app is quite simple, it should be designed in a scalable and maintainable way. Ideally the app should be responsive.

We've included:

- A sample [Next.js](https://nextjs.org/) project with a Typescript setup for your convenience.
- Some CSS colour variables that match the colours in the design as guidance.
- The assets that you will need to complete the design.

## Getting started

First you'll need to install your dependencies

```sh
cd client && pnpm install
```

## Start the app

```sh
cd client && pnpm dev
```

This will do two things:

- Start a Next.js app running in development on <http://localhost:3000>
- Start a graphQL stub server running on <http://localhost:3001/graphql>

## Running tests

You can run tests from the client directory.

```sh
cd client && pnpm test
```

## Basket API (full-stack)

The provided GraphQL stub is enough to complete the task above. As this is a full-stack role, we'd also like to see how you'd shape the API for a real basket. Please include a GraphQL schema for the basket operations you'd expect, such as fetching a basket and adding, updating or removing items.

Implementing it is optional, in any language or framework you like. The stub is generic CRUD and can't host custom logic, so run your own server alongside it or replace it, but keep serving `products`. If you don't implement it, briefly explain in your README how you'd build and persist it in production.

In your README, note where responsibilities sit (e.g. totals, validation) and any performance and security considerations.

## What we're looking for

We want to see how you approach this problem in a real-world scenario. Consider how your solution scales, handles edge cases, and anticipates future requirements in a production environment.

We would like you to demonstrate your ability to:

- Reason through a programming problem
- Proficiently use Nextjs and Typescript
- Implement a visual design accurately
- Implement some user interactions
- Write production-ready code for a high traffic app
- Design a clear API contract, with sound front-end/back-end responsibilities and awareness of performance and security
- Write tests that document and safeguard the program's behaviour
- Use a version control system (e.g. git) to effectively convey intent

## Implementation notes

### What's implemented

`client/app/product/page.tsx` is a server component that fetches the product
over GraphQL from the stub server (`lib/graphql/products.ts` /
`lib/graphql/client.ts`) and renders it through small, single-responsibility
components under `client/components/`. The quantity stepper and "Add to
cart" button live in `PurchasePanel`, the only client component, and hold
local state only (see below). Styling uses CSS Modules and the brand colour
variables already in `styles/globals.css`, with a breakpoint at 768px that
turns the stacked mobile hero into a two-column layout on larger screens.
Tests live in `client/test/` (formatting helpers, the GraphQL client,
`PurchasePanel` interactions, `ProductSpecifications`, and the page itself).

The product route is hardcoded to id `1`, matching the single product the
stub seeds. In production this would be `/product/[id]`, reading the id from
the route params.

### Basket API design

"Add to cart" currently only updates local component state in the browser —
there's no basket persistence. Below is the schema I'd expose for a real
basket, and where I'd put it.

```graphql
type Basket {
  id: ID!
  items: [BasketItem!]!
  subtotal: Int! # pence, server-computed from current product prices
}

type BasketItem {
  id: ID!
  product: Product!
  quantity: Int!
  lineTotal: Int! # pence, server-computed
}

type Query {
  basket: Basket! # resolved from the caller's session/auth context
}

type Mutation {
  addBasketItem(productId: ID!, quantity: Int!): Basket!
  updateBasketItemQuantity(itemId: ID!, quantity: Int!): Basket!
  removeBasketItem(itemId: ID!): Basket!
}
```

**Responsibilities.** The client only ever sends a `productId` and a
`quantity` it wants; it never sends a price. The server looks up the current
product price and computes `lineTotal`/`subtotal` itself and is the single
source of truth for the basket's contents — the client renders whatever the
mutation response returns rather than guessing at the new state. The server
also owns validation: quantity bounds, that the product still exists, and
(eventually) stock availability.

**Persistence.** `basket` resolves off an identifier in the request —  an
httpOnly session cookie for anonymous users, merged into the authenticated
user's basket on login. I'd store baskets in a fast key-value store (e.g.
Redis) keyed by that id with a TTL for abandoned baskets, rather than a
relational table, since a basket is read/written far more often than it's
queried for reporting; if that data is ever needed for analytics I'd stream
basket events out rather than query the live store.

**Performance.** Product data (price, name, etc.) is read-heavy and
cacheable (CDN/ISR), whereas basket mutations are low-latency, per-user
writes that shouldn't be cached — keeping them as separate concerns, as the
schema above does, avoids tying basket write latency to catalogue cache
invalidation. Basket mutations return the full updated basket so the client
never needs a follow-up fetch.

**Security.** All mutations re-derive price server-side and never trust a
client-submitted amount. Basket identity comes from the session (httpOnly,
signed cookie), not a client-supplied id, so one user can't read or mutate
another's basket. Mutation endpoints need CSRF protection since they're
state-changing, and quantity/rate limits on `addBasketItem` /
`updateBasketItemQuantity` guard against scripted abuse.

Best of luck!
