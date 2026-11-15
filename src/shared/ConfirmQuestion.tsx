import { useId, type KeyboardEvent, type RefObject } from "react";
import shared from "./Board.module.css";
import styles from "./ConfirmQuestion.module.css";

// The visible text of an answer is short, for example "Yes". The label tells a screen reader what it does.
type Answer = { readonly text: string; readonly label: string };

type ConfirmQuestionProps = {
  question: string;
  yes: Answer;
  no: Answer;
  noRef: RefObject<HTMLButtonElement | null>;
  onYes: () => void;
  onNo: () => void;
};

// The question of a two-step button and its two answers. It shows in place of the button. See "useConfirm.ts".
// A two-step button is for an action that deletes something, thus "Yes" has the danger colour.
// A fast double click on the button lands on the question text, not on "Yes", because the text is first.
// The Escape key is the same as "No", as it closes a dialog.
// The focus goes to "No", so a screen reader reads its label first. Each answer has the question as its
// description, so a screen reader reads the question too, for example "No, keep playing. Restart the puzzle?".
export function ConfirmQuestion({ question, yes, no, noRef, onYes, onNo }: ConfirmQuestionProps) {
  const questionId = useId();
  const noOnEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") onNo();
  };
  const buttonClass = `${shared.button} ${shared.boxed}`;
  const yesClass = `${buttonClass} ${shared.dangerSolid}`;
  return (
    <span className={styles.question}>
      <span id={questionId} className={styles.text}>
        {question}
      </span>
      <button
        type="button"
        className={yesClass}
        aria-label={yes.label}
        aria-describedby={questionId}
        onKeyDown={noOnEscape}
        onClick={onYes}
      >
        {yes.text}
      </button>
      <button
        ref={noRef}
        type="button"
        className={buttonClass}
        aria-label={no.label}
        aria-describedby={questionId}
        onKeyDown={noOnEscape}
        onClick={onNo}
      >
        {no.text}
      </button>
    </span>
  );
}
