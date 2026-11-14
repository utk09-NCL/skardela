import board from "./Board.module.css";
import styles from "./RuleList.module.css";

// The fill of a small sample square. "empty" is an outline only. "water" is the water of Latics.
// "monster" is an empty square with the Latics monster, as on the board.
type SampleFill = "green" | "yellow" | "red" | "blue" | "empty" | "water" | "monster";

// A sample shows the colour and the symbol of a game square. "isGiven" adds the dot of a given square.
type Sample = { fill: SampleFill; symbol: string; isGiven?: boolean };

// A part of a rule: a text, or a symbol in a colour, for example a red "●".
// The text next to the symbol says the colour too, so a screen reader does not read the symbol.
export type RulePart = string | { readonly symbol: string; readonly colour: "red" | "blue" };

// A rule is a text. A rule can also show a small sample square, for example the green square of Guzzle.
// The sample shows the colour and the symbol. The text says the colour too, for a screen reader.
// A rule with parts shows symbols in colour in the line of the text.
export type Rule = string | { text: string; sample: Sample } | { parts: readonly RulePart[] };

// One item of a key: a sample square and a short text that tells what it means.
export type KeyItem = { text: string; sample: Sample };

function SampleSquare({ sample }: { sample: Sample }) {
  return (
    <span
      className={styles.sample}
      data-fill={sample.fill}
      data-given={sample.isGiven === true}
      aria-hidden="true"
    >
      {sample.fill === "monster" ? <span className={board.monster} /> : sample.symbol}
    </span>
  );
}

// The text of a rule with parts. React uses it as the key of the rule.
function partsText(parts: readonly RulePart[]): string {
  return parts.map((part) => (typeof part === "string" ? part : part.symbol)).join("");
}

function RuleItem({ rule }: { rule: Rule }) {
  if (typeof rule === "string") return <li>{rule}</li>;
  if ("parts" in rule) {
    return (
      <li>
        {rule.parts.map((part, index) =>
          typeof part === "string" ? (
            part
          ) : (
            // oxlint-disable-next-line react/no-array-index-key -- the parts never move. Two parts can be the same.
            <span key={index} className={styles.mark} data-colour={part.colour} aria-hidden="true">
              {part.symbol}
            </span>
          ),
        )}
      </li>
    );
  }
  return (
    <li>
      <SampleSquare sample={rule.sample} />
      {rule.text}
    </li>
  );
}

// This list shows the rules of a puzzle type.
// All puzzle types use it, so each type only gives its rule text.
export function RuleList({ rules }: { rules: readonly Rule[] }) {
  return (
    <ol className={styles.rules}>
      {rules.map((rule) => {
        const key =
          typeof rule === "string" ? rule : "parts" in rule ? partsText(rule.parts) : rule.text;
        return <RuleItem key={key} rule={rule} />;
      })}
    </ol>
  );
}

// This list shows a key: small chips with a sample square and its meaning, for example "correct".
// The text tells the meaning, so the colour is not the only signal. An empty key shows nothing.
export function KeyList({ items, label }: { items: readonly KeyItem[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={styles.key} aria-label={label}>
      {items.map((item) => (
        <li key={item.text} className={styles.keyItem}>
          <SampleSquare sample={item.sample} />
          {item.text}
        </li>
      ))}
    </ul>
  );
}
