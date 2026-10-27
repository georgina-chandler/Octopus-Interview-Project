import type { Product } from "../graphql/products";

const GBP_FORMATTER = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Formats a price given in pence as a GBP currency string, e.g. 1299 -> "£12.99" */
export function formatPrice(pricePence: number): string {
  return GBP_FORMATTER.format(pricePence / 100);
}

/** e.g. "12.6 x 6.2 x 6.2" */
export function formatDimensions(
  product: Pick<Product, "height" | "width" | "length">,
): string {
  return `${product.height} x ${product.width} x ${product.length}`;
}
