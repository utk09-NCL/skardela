import { useEffect, type SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { loadAnalytics } from "../../shared/analytics";
import { getLogger } from "../../shared/logger";
import { useAppStore } from "../../shared/state/store";
import styles from "./AnalyticsNotice.module.css";

// This notice tells a new player that the site uses analytics. It shows on each page until the player selects OK.
// The analytics script loads only after the OK. The browser keeps the OK in the setting "cookieBanner",
// thus a returning player does not see the notice again. The footer tells returning players about the analytics.
export function AnalyticsNotice() {
  const isAcknowledged = useAppStore((state) => state.cookieBanner);
  const acknowledgeNotice = useAppStore((state) => state.acknowledgeNotice);

  useEffect(() => {
    if (isAcknowledged) loadAnalytics();
  }, [isAcknowledged]);

  if (isAcknowledged) return null;
  return (
    <NoticeDialog
      onAcknowledge={() => {
        getLogger("ui.analytics-notice").info("Analytics notice acknowledged");
        acknowledgeNotice();
      }}
    />
  );
}

// A modal dialog makes the rest of the page inert. Thus the player cannot use the site before the OK.
// The ref opens the dialog when React adds it to the page. In strict mode React adds the ref two times,
// thus the ref opens the dialog only when it is not open.
function openModal(dialog: HTMLDialogElement | null) {
  if (dialog !== null && !dialog.open) dialog.showModal();
}

// The Escape key sends "cancel". The notice stays open, because only the OK closes it.
function keepOpen(event: SyntheticEvent<HTMLDialogElement>) {
  event.preventDefault();
}

// Some browsers close a dialog after the Escape key two times, also when "cancel" is stopped.
// Then the dialog opens again. After the OK, React removes the dialog, thus it does not open again.
function openAgain(event: SyntheticEvent<HTMLDialogElement>) {
  if (event.currentTarget.isConnected) event.currentTarget.showModal();
}

function NoticeDialog({ onAcknowledge }: { onAcknowledge: () => void }) {
  const { t } = useTranslation();
  return (
    <dialog
      ref={openModal}
      className={styles.notice}
      aria-labelledby="analytics-notice-title"
      aria-describedby="analytics-notice-body"
      closedby="none"
      onCancel={keepOpen}
      onClose={openAgain}
    >
      <div className={styles.text}>
        <h2 id="analytics-notice-title" className={styles.title}>
          {t(($) => $.analyticsNotice.title)}
        </h2>
        <p id="analytics-notice-body">{t(($) => $.analyticsNotice.body)}</p>
      </div>
      <button type="button" className={styles.ok} onClick={onAcknowledge}>
        {t(($) => $.analyticsNotice.ok)}
      </button>
    </dialog>
  );
}
