import styles from "./ProductDescription.module.css";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Description</h2>
      <p className={styles.body}>{description}</p>
    </section>
  );
}
