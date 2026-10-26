import { fetchGraphQL } from "./client";

export interface Product {
  id: string;
  name: string;
  /** e.g. "25W" */
  power: string;
  description: string;
  /** Price in pence */
  price: number;
  /** Units per pack, e.g. 4 for "Packet of 4" */
  quantity: number;
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
      power
      description
      price
      quantity
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
