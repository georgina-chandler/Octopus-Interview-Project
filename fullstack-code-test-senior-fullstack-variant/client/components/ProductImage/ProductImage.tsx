import Image from "next/image";
import styles from "./ProductImage.module.css";

interface ProductImageProps {
  alt: string;
}

export function ProductImage({ alt }: ProductImageProps) {
  return (
    <div className={styles.frame}>
      <Image
        src="/philips-plumen.jpg"
        alt={alt}
        fill
        sizes="(min-width: 768px) 480px, 90vw"
        className={styles.image}
        priority
      />
    </div>
  );
}
