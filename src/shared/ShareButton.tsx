import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getLogger } from "./logger";
import { sendText, type ShareOutcome } from "./share";

const log = getLogger("ui.share");

// The time that the button shows "Copied" or "Not copied". Then it shows its label again.
const outcomeTime = 3000;

type ShareButtonProps = {
  // The share text. The button makes it when the player selects the button.
  getText: () => string;
  label: string;
  // A longer name for a screen reader, when the visible label is not enough, for example "Share".
  accessibleName?: string;
  className?: string;
};

// A button that shares a result: the share menu on a phone, or a copy to the clipboard on a computer.
// After a copy, the button shows "Copied" for a short time. The status message tells a screen reader the result.
export function ShareButton({ getText, label, accessibleName, className }: ShareButtonProps) {
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  useEffect(() => {
    if (outcome === null) return;
    const timer = setTimeout(() => {
      setOutcome(null);
    }, outcomeTime);
    return () => {
      clearTimeout(timer);
    };
  }, [outcome]);

  const share = async () => {
    const result = await sendText(getText());
    log.info("Result shared", { outcome: result });
    setOutcome(result);
  };
  const messages: Record<ShareOutcome, string> = {
    copied: t(($) => $.share.copiedMessage),
    shared: t(($) => $.share.sharedMessage),
    cancelled: "",
    failed: t(($) => $.share.failedMessage),
  };
  const buttonText =
    outcome === "copied"
      ? t(($) => $.share.copied)
      : outcome === "failed"
        ? t(($) => $.share.failed)
        : label;

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={accessibleName}
        data-outcome={outcome ?? "none"}
        onClick={() => {
          void share();
        }}
      >
        {buttonText}
      </button>
      {/* The <output> is always on the page, so a screen reader reads each new message. */}
      <output className="visually-hidden">{outcome === null ? "" : messages[outcome]}</output>
    </>
  );
}
