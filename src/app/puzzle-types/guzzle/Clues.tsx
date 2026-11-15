import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { lineIndexes, lineNames, lineOf, type GuzzlePuzzle } from "./puzzle";

const words = text.guzzle;

type Props = { clues: GuzzlePuzzle["clues"]; size: number; selected: number | null };

// The list shows the clue of each word, with the same arrow as the first square of the word.
// The clue of the selected word is marked. It also tells the position of the selected square in the word,
// so the player knows the direction to read the word.
export function Clues({ clues, size, selected }: Props) {
  const selectedLine = selected === null ? undefined : lineOf(selected, size);
  return (
    <ul className={styles.clues} aria-label={words.cluesLabel}>
      {lineNames.map((line) => {
        const isSelected = line === selectedLine;
        const position = selected === null ? -1 : lineIndexes(line, size).indexOf(selected) + 1;
        return (
          <li key={line} className={styles.clue} aria-current={isSelected ? "true" : undefined}>
            <span className={styles.clueArrow} aria-hidden="true">
              {words.symbols.arrows[line]}
            </span>
            <span>
              <strong>{words.clueLines[line]}</strong>
              {isSelected && ` (${words.position(position, size)})`}{" "}
              <span className={styles.clueText}>{clues[line]}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
