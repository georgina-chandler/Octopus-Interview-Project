import { fetchGraphQL } from "./client";

export interface Product {
  id: string;
  name: string;
  /** Short line shown under the product name, e.g. "25W // Packet of 4" */
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
  const data = await fetchGraphQL<{ Product: Product | null }>(
    PRODUCT_QUERY,
    { id },
    { cache: "no-store" },
  );
  return data.Product;
}
