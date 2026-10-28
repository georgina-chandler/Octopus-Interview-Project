// The basket server is a separate service from the product catalogue (the
// json-graphql-server stub) — it talks to it over HTTP like any other
// client would, rather than importing the Next app's internal code. This
// small query is intentionally a standalone duplicate of the one in
// client/lib/graphql/products.ts, not a shared module, since the two
// services are meant to be independently deployable.

const PRODUCTS_ENDPOINT = process.env.PRODUCTS_GRAPHQL_ENDPOINT ?? "http://localhost:3001/graphql";

const PRODUCT_QUERY = `
  query Product($id: ID!) {
    Product(id: $id) {
      id
      name
      subtitle
      price
      img_url
    }
  }
`;

async function getProduct(id) {
  const res = await fetch(PRODUCTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: PRODUCT_QUERY, variables: { id } }),
  });

  if (!res.ok) {
    throw new Error(`Product catalogue request failed with status ${res.status}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join("; "));
  }

  return json.data.Product;
}

module.exports = { getProduct };
