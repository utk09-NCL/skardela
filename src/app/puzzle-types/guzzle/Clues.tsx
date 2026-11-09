import { useTranslation } from "react-i18next";
import { symbols } from "../../../text/symbols";
import styles from "./Board.module.css";
import { lineIndexes, lineNames, lineOf, type GuzzlePuzzle } from "./puzzle";

type Props = { clues: GuzzlePuzzle["clues"]; size: number; selected: number | null };

// The list shows the clue of each word, with the same arrow as the first square of the word.
// The clue of the selected word is marked. It also tells the position of the selected square in the word,
// so the player knows the direction to read the word.
export function Clues({ clues, size, selected }: Props) {
  const { t } = useTranslation();
  const selectedLine = selected === null ? undefined : lineOf(selected, size);
  return (
    <ul className={styles.clues} aria-label={t(($) => $.guzzle.cluesLabel)}>
      {lineNames.map((line) => {
        const isSelected = line === selectedLine;
        const position = selected === null ? -1 : lineIndexes(line, size).indexOf(selected) + 1;
        return (
          <li key={line} className={styles.clue} aria-current={isSelected ? "true" : undefined}>
            <span className={styles.clueArrow} aria-hidden="true">
              {symbols.guzzle.arrows[line]}
            </span>
            <span>
              <strong>{t(($) => $.guzzle.clueLines[line])}</strong>
              {isSelected && ` (${t(($) => $.guzzle.position, { position, length: size })})`}:{" "}
              {clues[line]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
