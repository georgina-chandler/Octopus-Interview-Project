import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.legal}>
        Octopus Energy Ltd is a company registered in England and Wales.
        Registered number: 09263424. Registered office: 33 Holborn, London,
        EC1N 2HT. Trading office: 20-24 Broadwick Street, London, W1F 8HT
      </p>
    </footer>
  );
}
