"use client";

import { useState } from "react";
import { formatPrice } from "../../lib/format/product";
import type { Product } from "../../lib/graphql/products";
import styles from "./PurchasePanel.module.css";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

interface PurchasePanelProps {
  product: Pick<Product, "name" | "subtitle" | "price">;
}

export function PurchasePanel({ product }: PurchasePanelProps) {
  const [qty, setQty] = useState(MIN_QUANTITY);
  const [addedQty, setAddedQty] = useState<number | null>(null);

  const decrement = () => {
    setAddedQty(null);
    setQty((current) => Math.max(MIN_QUANTITY, current - 1));
  };
  const increment = () => {
    setAddedQty(null);
    setQty((current) => Math.min(MAX_QUANTITY, current + 1));
  };

  const handleAddToCart = () => {
    // No basket backend is wired up yet (see README) — track the action locally
    // so the UI can confirm the interaction happened.
    setAddedQty(qty);
  };

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>{product.name}</h1>
      <p className={styles.subtitle}>{product.subtitle}</p>

      <div className={styles.purchaseRow}>
        <p className={styles.price}>{formatPrice(product.price)}</p>

        <div className={styles.stepper}>
          <span className={styles.stepperLabel} id="qty-label">
            Qty
          </span>
          <div className={styles.stepperControls} role="group" aria-labelledby="qty-label">
            <button
              type="button"
              className={styles.stepperButton}
              onClick={decrement}
              disabled={qty <= MIN_QUANTITY}
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span className={styles.stepperValue} aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              className={`${styles.stepperButton} ${styles.stepperButtonAdd}`}
              onClick={increment}
              disabled={qty >= MAX_QUANTITY}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button type="button" className={styles.addToCart} onClick={handleAddToCart}>
        Add to cart
      </button>
      <p className={styles.addedMessage} aria-live="polite">
        {addedQty !== null ? `Added ${addedQty} to your cart` : ""}
      </p>
    </div>
  );
}
