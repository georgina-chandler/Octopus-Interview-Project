import { formatDimensions } from "../../lib/format/product";
import type { Product } from "../../lib/graphql/products";
import styles from "./ProductSpecifications.module.css";

interface ProductSpecificationsProps {
  product: Pick<
    Product,
    "brand" | "weight" | "height" | "width" | "length" | "model_code" | "colour"
  >;
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const specs: { label: string; value: string }[] = [
    { label: "Brand", value: product.brand },
    { label: "Item weight (g)", value: String(product.weight) },
    { label: "Dimensions (cm)", value: formatDimensions(product) },
    { label: "Item Model number", value: product.model_code },
    { label: "Colour", value: product.colour },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Specifications</h2>
      <dl className={styles.list}>
        {specs.map((spec) => (
          <div className={styles.row} key={spec.label}>
            <dt className={styles.label}>{spec.label}</dt>
            <dd className={styles.value}>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
