import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyList, RuleList } from "../../../shared/RuleList";
import { useAppStore } from "../../../shared/state/store";
import type { PuzzleType } from "../../puzzle-types/registry";
import styles from "./PuzzlePage.module.css";

// The rules beside the board: three short rules, a key when the type has one, and "More rules".
// "More rules" is open on the first visit to a puzzle type only. The saved data keeps the types
// that the player opened. Each type gets its own panel (see the key in "PuzzleSide"), so the value is
// read again for a different type.
export function PuzzleRules({ type }: { type: PuzzleType }) {
  const { t } = useTranslation();
  // The value is read one time, so "More rules" stays open on this visit after the type is saved as seen.
  const [isOpen, setIsOpen] = useState(() => !useAppStore.getState().seenRules.includes(type));
  useEffect(() => {
    useAppStore.getState().seeRules(type);
  }, [type]);

  return (
    <section aria-labelledby="rules-heading" className={styles.rules}>
      <h2 id="rules-heading">{t(($) => $.puzzlePage.rulesHeading)}</h2>
      <RuleList rules={t(($) => $[type].rules, { returnObjects: true })} />
      <KeyList
        items={t(($) => $[type].rulesKey, { returnObjects: true })}
        label={t(($) => $.puzzlePage.keyLabel)}
      />
      <details
        className={styles.moreRules}
        open={isOpen}
        onToggle={(event) => {
          setIsOpen(event.currentTarget.open);
        }}
      >
        <summary>{t(($) => $[type].moreRules.label)}</summary>
        <RuleList rules={t(($) => $[type].moreRules.rules, { returnObjects: true })} />
      </details>
    </section>
  );
}
