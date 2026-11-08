import { Link, Outlet } from "react-router";
import { text } from "../../text/en";
import { AnalyticsNotice } from "./AnalyticsNotice";
import styles from "./Layout.module.css";
import { StorageNotice } from "./StorageNotice";
import { StreakPill } from "./StreakPill";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useReloadAtMidnight } from "./useReloadAtMidnight";

// The footer year comes from the date, so the text does not need a change each year.
// It is read one time when the app loads, because a render must not read the clock.
const currentYear = new Date().getFullYear();

// The frame of each page: a sticky header, the main content and the footer.
// The header and the footer go across the full width. Their content has the width of the main content.
// Each page gets the puzzles of the new day after midnight. See "useReloadAtMidnight.ts".
export function Layout() {
  useReloadAtMidnight();
  return (
    <>
      <a className={styles.skipLink} href="#main">
        {text.skipLink}
      </a>
      <header className={styles.header}>
        <div className={`content-width ${styles.headerInner}`}>
          {/* The logo is decoration. The site name next to it is the name of the link. */}
          <nav aria-label={text.nav.label} className={styles.nav}>
            <Link className={styles.brand} to="/">
              <img src="/favicon.svg" alt="" width="28" height="28" />
              <span>{text.siteName}</span>
            </Link>
            <Link className={styles.navLink} to="/#stats">
              {text.nav.stats}
            </Link>
          </nav>
          <StreakPill />
          <ThemeSwitcher />
        </div>
      </header>
      <main id="main" className={`content-width ${styles.main}`} tabIndex={-1}>
        <StorageNotice />
        <Outlet />
      </main>
      <footer className={styles.footer}>
        {/* The name and the link are in the first line. The legal line is smaller, under them. */}
        <div className={`content-width ${styles.footerInner}`}>
          <p className={styles.footerTagline}>{text.footer.tagline}</p>
          <a
            className={styles.footerLink}
            href={text.footer.source.href}
            target="_blank"
            rel="noreferrer"
          >
            {text.footer.source.label}
          </a>
          <p className={styles.footerLegal}>{text.footer.content(currentYear)}</p>
        </div>
      </footer>
      {/* The notice shows on each page, because a new player can open a puzzle link first. */}
      <AnalyticsNotice />
    </>
  );
}
