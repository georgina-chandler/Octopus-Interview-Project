import { fetchGraphQL } from "./client";

const PRODUCTS_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "http://localhost:3001/graphql";

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  /** Price in pence */
  price: number;
  brand: string;
  /** Grams */
  weight: number;
  /** Centimetres */
  height: number;
  width: number;
  length: number;
  model_code: string;
  colour: string;
  img_url: string;
}

const PRODUCT_QUERY = `
  query Product($id: ID!) {
    Product(id: $id) {
      id
      name
      subtitle
      description
      price
      brand
      weight
      height
      width
      length
      model_code
      colour
      img_url
    }
  }
`;

export async function getProduct(id: string): Promise<Product | null> {
  // Opt out of Next's default fetch caching so each page load reflects the
  // stub's current data rather than a stale cached response.
  const data = await fetchGraphQL<{ Product: Product | null }>(
    PRODUCTS_ENDPOINT,
    PRODUCT_QUERY,
    { id },
    { cache: "no-store" },
  );
  return data.Product;
}
