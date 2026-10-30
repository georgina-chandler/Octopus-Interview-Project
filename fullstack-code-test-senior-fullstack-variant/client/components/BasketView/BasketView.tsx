"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearBasket,
  getBasket,
  removeBasketItem,
  updateBasketItemQuantity,
} from "../../lib/basket/client";
import type { Basket } from "../../lib/basket/types";
import { formatPrice } from "../../lib/format/product";
import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import styles from "./BasketView.module.css";

type LoadState = "loading" | "ready" | "error";

export function BasketView() {
  const [basket, setBasket] = useState<Basket | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getBasket()
      .then((result) => {
        if (!cancelled) {
          setBasket(result);
          setLoadState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    setPendingItemId(itemId);
    try {
      setBasket(await updateBasketItemQuantity(itemId, quantity));
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setPendingItemId(itemId);
    try {
      setBasket(await removeBasketItem(itemId));
    } finally {
      setPendingItemId(null);
    }
  };

  const handleClear = async () => {
    setBasket(await clearBasket());
  };

  if (loadState === "loading") {
    return <p className={styles.status}>Loading your basket…</p>;
  }

  if (loadState === "error" || !basket) {
    return (
      <p className={styles.status}>Couldn&apos;t load your basket — please try again.</p>
    );
  }

  if (basket.items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Your basket is empty.</p>
        <Link href="/product" className={styles.continueLink}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className={styles.list}>
        {basket.items.map((item) => (
          <li className={styles.item} key={item.id}>
            <img
              className={styles.thumbnail}
              src={item.product.imgUrl}
              alt=""
              width={56}
              height={56}
              loading="lazy"
              // product images are hosted externally (see the catalogue
              // stub's img_url) — hide the broken-image icon rather than
              // show it if that host is ever down or the link has rotted.
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />

            <div className={styles.itemInfo}>
              <p className={styles.itemName}>{item.product.name}</p>
              <p className={styles.itemSubtitle}>{item.product.subtitle}</p>
            </div>

            <QuantityStepper
              value={item.quantity}
              onChange={(next) => handleQuantityChange(item.id, next)}
              disabled={pendingItemId === item.id}
              label={`Quantity of ${item.product.name}`}
            />

            <p className={styles.itemTotal}>{formatPrice(item.lineTotal)}</p>

            <button
              type="button"
              className={styles.removeButton}
              onClick={() => handleRemove(item.id)}
              disabled={pendingItemId === item.id}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.summary}>
        <p className={styles.subtotal}>
          Subtotal <span>{formatPrice(basket.subtotal)}</span>
        </p>
        <button type="button" className={styles.clearButton} onClick={handleClear}>
          Clear basket
        </button>
      </div>
    </div>
  );
}
