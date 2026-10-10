import { Link, Outlet } from "react-router";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { text } from "../text/en";
import styles from "./Layout.module.css";

export function Layout() {
  return (
    <>
      <a className={styles.skipLink} href="#main">
        {text.skipLink}
      </a>
      <header className={styles.header}>
        <Link className={styles.siteName} to="/">
          {text.siteName}
        </Link>
        <nav aria-label={text.nav.label} className={styles.nav}>
          <Link to="/">{text.nav.home}</Link>
        </nav>
        <LanguageSwitcher />
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>{text.footer.content}</p>
      </footer>
    </>
  );
}
