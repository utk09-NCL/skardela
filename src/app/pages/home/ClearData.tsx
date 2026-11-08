import { ConfirmQuestion } from "../../../shared/ConfirmQuestion";
import shared from "../../../shared/Board.module.css";
import { getLogger } from "../../../shared/logger";
import { reloadPage } from "../../../shared/reload";
import { useAppStore } from "../../../shared/state/store";
import { useConfirm } from "../../../shared/useConfirm";
import { text } from "../../../text/en";

const words = text.home.stats.clear;

// "Clear my data" deletes all saved data of Skardela, for example when something is stuck. It asks one time.
// The button has the danger colour, because the delete cannot be undone.
// After "Yes", the page loads again as for a new player. Thus the analytics script also stops,
// and the analytics notice shows again.
export function ClearData() {
  const clearData = useAppStore((state) => state.clearData);
  const { isOpen, buttonRef, yesRef, open, close } = useConfirm();
  const clear = () => {
    getLogger("ui.clear-data").info("Saved data cleared");
    clearData();
    reloadPage();
  };
  if (isOpen) {
    return (
      <ConfirmQuestion
        question={words.question}
        yes={words.yes}
        no={words.no}
        yesRef={yesRef}
        onYes={clear}
        onNo={close}
      />
    );
  }
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${shared.button} ${shared.boxed} ${shared.danger}`}
      onClick={open}
    >
      {words.button}
    </button>
  );
}
