import { useEffect, useState } from "react";
import { KeyList, RuleList } from "../../../shared/RuleList";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import type { PuzzleType } from "../../puzzle-types/registry";
import styles from "./PuzzlePage.module.css";

const page = text.puzzlePage;

// The rules beside the board: three short rules, a key when the type has one, and "More rules".
// "More rules" is open on the first visit to a puzzle type only. The saved data keeps the types
// that the player opened. Each type gets its own panel (see the key in "PuzzleSide"), so the value is
// read again for a different type.
export function PuzzleRules({ type }: { type: PuzzleType }) {
  const words = text[type];
  // The value is read one time, so "More rules" stays open on this visit after the type is saved as seen.
  const [isOpen, setIsOpen] = useState(() => !useAppStore.getState().seenRules.includes(type));
  useEffect(() => {
    useAppStore.getState().seeRules(type);
  }, [type]);

  return (
    <section aria-labelledby="rules-heading" className={styles.rules}>
      <h2 id="rules-heading">{page.rulesHeading}</h2>
      <RuleList rules={words.rules} />
      <KeyList items={words.rulesKey} label={page.keyLabel} />
      <details
        className={styles.moreRules}
        open={isOpen}
        onToggle={(event) => {
          setIsOpen(event.currentTarget.open);
        }}
      >
        <summary>{words.moreRules.label}</summary>
        <RuleList rules={words.moreRules.rules} />
      </details>
    </section>
  );
}
