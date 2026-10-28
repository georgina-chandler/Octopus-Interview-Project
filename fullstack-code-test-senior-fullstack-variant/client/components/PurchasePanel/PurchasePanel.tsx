"use client";

import Link from "next/link";
import { useState } from "react";
import { addBasketItem } from "../../lib/basket/client";
import { formatPrice } from "../../lib/format/product";
import type { Product } from "../../lib/graphql/products";
import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import styles from "./PurchasePanel.module.css";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

interface PurchasePanelProps {
  product: Pick<Product, "id" | "name" | "subtitle" | "price">;
}

type AddToCartStatus = "idle" | "pending" | "error";

export function PurchasePanel({ product }: PurchasePanelProps) {
  const [qty, setQty] = useState(MIN_QUANTITY);
  const [status, setStatus] = useState<AddToCartStatus>("idle");
  const [addedQty, setAddedQty] = useState<number | null>(null);

  const handleQtyChange = (next: number) => {
    setAddedQty(null);
    setQty(next);
  };

  const handleAddToCart = async () => {
    setStatus("pending");
    try {
      await addBasketItem(product.id, qty);
      setAddedQty(qty);
      setStatus("idle");
    } catch {
      setAddedQty(null);
      setStatus("error");
    }
  };

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>{product.name}</h1>
      <p className={styles.subtitle}>{product.subtitle}</p>

      <div className={styles.purchaseRow}>
        <p className={styles.price}>{formatPrice(product.price)}</p>

        <div className={styles.stepper}>
          <span className={styles.stepperLabel}>Qty</span>
          <QuantityStepper
            value={qty}
            onChange={handleQtyChange}
            min={MIN_QUANTITY}
            max={MAX_QUANTITY}
            disabled={status === "pending"}
            label="Quantity to add to basket"
          />
        </div>
      </div>

      <button
        type="button"
        className={styles.addToCart}
        onClick={handleAddToCart}
        disabled={status === "pending"}
      >
        {status === "pending" ? "Adding…" : "Add to cart"}
      </button>
      <p className={styles.addedMessage} aria-live="polite">
        {status === "error" && "Couldn't add to your basket — please try again."}
        {addedQty !== null && (
          <>
            Added {addedQty} to your basket.{" "}
            <Link href="/basket" className={styles.basketLink}>
              View basket
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
