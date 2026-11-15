import type { RefObject } from "react";
import { ConfirmQuestion } from "../../../shared/ConfirmQuestion";
import { getLogger } from "../../../shared/logger";
import { reloadPage } from "../../../shared/reload";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";

const words = text.stats.clear;

type ClearQuestionProps = {
  yesRef: RefObject<HTMLButtonElement | null>;
  onNo: () => void;
};

// The question after "Clear my data". It shows in place of the data buttons. See "DataActions.tsx".
// "Clear my data" deletes all saved data of Skardela, for example when something is stuck.
// After "Delete", the page loads again as for a new player. Thus the analytics script also stops,
// and the analytics notice shows again.
export function ClearQuestion({ yesRef, onNo }: ClearQuestionProps) {
  const clearData = useAppStore((state) => state.clearData);
  const clear = () => {
    getLogger("ui.clear-data").info("Saved data cleared");
    clearData();
    reloadPage();
  };
  return (
    <ConfirmQuestion
      question={words.question}
      yes={words.yes}
      no={words.no}
      yesRef={yesRef}
      onYes={clear}
      onNo={onNo}
    />
  );
}
