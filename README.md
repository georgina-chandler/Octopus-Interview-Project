# Implementation notes

Notes on the solution in [`fullstack-code-test-senior-fullstack-variant`](fullstack-code-test-senior-fullstack-variant/), kept separate from that directory's own `README.md` (the original code test brief, left untouched).

## What's implemented

`client/app/product/page.tsx` is a server component that fetches the product
over GraphQL from the stub server (`lib/graphql/products.ts` /
`lib/graphql/client.ts`) and renders it through small, single-responsibility
components under `client/components/`. Styling uses CSS Modules and the
brand colour variables already in `styles/globals.css`, with a breakpoint at
768px that turns the stacked mobile hero into a two-column layout on larger
screens.

The basket is a real, working feature, not just UI: "Add to cart" calls a
GraphQL mutation against a genuinely separate basket server (see below),
`/basket` lists the current basket and lets you update quantities, remove
items and clear it, and the header's basket icon links there. `pnpm dev`
(from `client/`) still starts everything — the product stub, the basket
server, and the Next app — no extra install step or manual process.

Tests live in `client/test/`: formatting helpers, both GraphQL clients, the
basket store, the basket resolvers (executed through a Yoga instance, not
mocked), and the UI components (`PurchasePanel`, `BasketView`,
`QuantityStepper`, `ProductSpecifications`, and the product page itself). The
basket store/resolver tests import `server/basket/*` directly by relative
path — that's a test-only shortcut to keep a single `pnpm test` entry point
without a second install; it doesn't reflect any runtime coupling between
the two services.

The product route is hardcoded to id `1`, matching the single product the
stub seeds. In production this would be `/product/[id]`, reading the id from
the route params.

## Basket API

The `products` stub (`json-graphql-server`, port 3001) is generic CRUD and
can't host custom logic, so the basket is its own, genuinely standalone
Node server — `server/basket-server.js`, with its schema/resolvers/store
under `server/basket/` — listening on its own port (3002), started
alongside the other two by `client/package.json`'s `basket-server` script.
It isn't a Next.js route: it's a plain `http.createServer` using
[graphql-yoga](https://the-guild.dev/graphql/yoga-server) for the GraphQL
layer, so from the browser's point of view it's a cross-origin API, not
same-origin like the rest of the app. The basket server doesn't import the
Next app's code to read product data — it calls the product stub over HTTP
itself (`server/basket/products.js`), exactly as a separate product-catalogue
service would in a real deployment.

`server/` deliberately has no `package.json`/install step of its own, to
keep `cd client && pnpm install` the only setup command (per the original
README, which this doesn't touch): `graphql`/`graphql-yoga` are installed as
devDependencies of `client/`, and `server/require-from-client.js` resolves
them explicitly from there for the two files that need them
(`basket-server.js`, `basket/resolvers.js`). A standalone deployment of this
service would instead give it its own `package.json` and install step.

```graphql
type BasketProduct {
  id: ID!
  name: String!
  subtitle: String!
  price: Int! # pence, captured from the catalogue when the item was added
  imgUrl: String!
}

type BasketItem {
  id: ID!
  product: BasketProduct!
  quantity: Int!
  lineTotal: Int! # pence: quantity * product.price, always server-computed
}

type Basket {
  id: ID!
  items: [BasketItem!]!
  subtotal: Int! # pence: sum of every item's lineTotal, always server-computed
}

type Query {
  basket: Basket! # resolved from the caller's session — never by id
}

type Mutation {
  addBasketItem(productId: ID!, quantity: Int = 1): Basket!
  updateBasketItemQuantity(itemId: ID!, quantity: Int!): Basket!
  removeBasketItem(itemId: ID!): Basket!
  clearBasket: Basket!
}
```

(`server/basket/schema.js`, `resolvers.js`, `store.js`, `session.js`; the
browser-side client that calls this API lives at `client/lib/basket/client.ts`.)

**Responsibilities.** The client sends only a `productId` and a `quantity`;
it never sends a price. `addBasketItem` looks up the product via the
catalogue API and snapshots `price`/`name`/`subtitle`/`imgUrl` onto the
basket item at that moment — `lineTotal` and `subtotal` are never stored,
always recomputed from `quantity * price` on read, so they can't drift out
of sync. The server owns all validation: quantity must be a whole number in
`[1, 99]`, the product must exist, and an `updateBasketItemQuantity` /
`removeBasketItem` must target an item that's actually in the caller's
basket — all enforced in `resolvers.js`, independent of (and in addition to)
the client-side bounds on `QuantityStepper`. Adding a product already in the
basket merges into the existing line (capped at 99) rather than creating a
duplicate row.

**What's actually running vs. a production shape.** The store
(`server/basket/store.js`) is an in-memory `Map` keyed by session id — enough
to demo the full flow and exercise the schema, but it resets on every server
restart and wouldn't be shared across instances of a horizontally-scaled or
serverless deployment. A real deployment would swap that module for Redis
(or similar), keyed the same way, with a TTL for abandoned baskets, without
the resolvers needing to change. Basket items are shaped so a later
checkout page could consume them directly (`product` snapshot + `quantity` +
server-computed `lineTotal`/`subtotal`) even though no such page exists here.

**Performance.** Product data is read-heavy and cacheable (the product page
fetch uses `no-store` only because the demo stub's data can change
underneath it); basket mutations are low-latency, per-user writes that
shouldn't be cached — keeping them on a separate endpoint from the product
catalogue, as implemented, avoids tying basket write latency to catalogue
cache invalidation. Every basket mutation returns the full updated basket so
the client never needs a follow-up query (see `lib/basket/client.ts`). Price
is snapshotted at add-time rather than looked up live on every basket read,
which keeps the basket view's price stable while browsing — a real checkout
step would still re-validate against the current catalogue price before
taking payment, since a snapshot alone isn't enough to guarantee the price
hasn't changed since the item was added.

**Security.** Basket identity comes from an httpOnly session cookie
(`server/basket/session.js`) minted on first request — never from a
client-supplied basket id — so one session can't read or mutate another's
basket (no IDOR). All mutations re-derive price server-side from the
catalogue and never trust a client-submitted amount.

Because the basket server is on a different port from the Next app, the
browser treats every call as cross-origin: CORS is handled explicitly
(`server/basket-server.js`), with the allowed origin read from
`CLIENT_ORIGIN` rather than `*`, since credentialed requests (ones that
send cookies) can't use a wildcard origin. The session cookie itself is
`SameSite=Lax` rather than `None; Secure` — `localhost:3000` and
`localhost:3002` are different *origins* but the same *site* (SameSite
ignores port), so `Lax` is sent on these cross-port requests without
needing HTTPS in dev; a deployment on genuinely different domains would
need `SameSite=None; Secure` instead.

Not implemented here, but needed for production: CSRF protection on the
mutation endpoint (an explicit, non-wildcard CORS origin plus `SameSite=Lax`
raises the bar for a drive-by cross-site request, but isn't a substitute for
a real CSRF token on state-changing requests), rate limiting on
`addBasketItem`/`updateBasketItemQuantity` to guard against scripted abuse,
and merging an anonymous session's basket into the user's account basket on
login.
