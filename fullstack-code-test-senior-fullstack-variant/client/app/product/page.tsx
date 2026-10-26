import { notFound } from "next/navigation";
import { ProductDescription } from "../../components/ProductDescription/ProductDescription";
import { ProductImage } from "../../components/ProductImage/ProductImage";
import { ProductSpecifications } from "../../components/ProductSpecifications/ProductSpecifications";
import { PurchasePanel } from "../../components/PurchasePanel/PurchasePanel";
import { SiteFooter } from "../../components/SiteFooter/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader/SiteHeader";
import { getProduct } from "../../lib/graphql/products";
import styles from "./page.module.css";

// The stub API only seeds a single product. A real catalogue would route this
// page as /product/[id] and read the id from params instead of hardcoding it.
const PRODUCT_ID = "1";

export default async function ProductPage() {
  const product = await getProduct(PRODUCT_ID);

  if (!product) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <div className={styles.productOverview}>
          <div className={styles.productOverviewInner}>
            <ProductImage alt={product.name} />
            <PurchasePanel product={product} />
          </div>
        </div>
        <div className={styles.contentBand}>
          <div className={styles.contentInner}>
            <ProductDescription description={product.description} />
            <ProductSpecifications product={product} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
