import Image from "next/image";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Image
          src="/octopus-logo.svg"
          alt="Octopus Energy"
          width={169}
          height={24}
          priority
        />
        <Link href="/basket" className={styles.basketButton} aria-label="View basket">
          <Image src="/basket.svg" alt="" width={22} height={20} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
