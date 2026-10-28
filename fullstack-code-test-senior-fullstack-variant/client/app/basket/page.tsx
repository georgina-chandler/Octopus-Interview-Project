import { BasketView } from "../../components/BasketView/BasketView";
import { SiteFooter } from "../../components/SiteFooter/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader/SiteHeader";
import styles from "./page.module.css";

export default function BasketPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className={styles.container}>
          <h1 className={styles.heading}>Your basket</h1>
          <BasketView />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
