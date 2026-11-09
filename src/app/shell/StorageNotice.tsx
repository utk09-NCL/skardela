import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useStorageStatus, type StorageStatus } from "../../shared/state/store";
import { symbols } from "../../text/symbols";
import styles from "./Layout.module.css";

// A message at the top of each page when the browser cannot save data: storage is blocked, it is full,
// or a different tab has a newer version of the app.
// The game still works, because the store keeps the data on this page. The player can close the message.
// A new problem, for example "full" after "unavailable", shows the message again.
export function StorageNotice() {
  const { t } = useTranslation();
  const status = useStorageStatus((state) => state.status);
  const [closed, setClosed] = useState<StorageStatus | null>(null);
  if (status === "ok" || status === closed) return null;
  return (
    <div className={styles.storageNotice} role="alert">
      <p>
        {t(($) => $.storage[status])}{" "}
        {status === "full" && <Link to="/#stats">{t(($) => $.storage.statsLink)}</Link>}
      </p>
      <button
        type="button"
        className={styles.storageClose}
        aria-label={t(($) => $.storage.close)}
        onClick={() => {
          setClosed(status);
        }}
      >
        {symbols.puzzlePage.close}
      </button>
    </div>
  );
}
