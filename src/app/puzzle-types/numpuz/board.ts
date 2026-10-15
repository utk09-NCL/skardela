import { createElement as h, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getLogger } from "../../../shared/logger";
import styles from "./Board.module.css";
import shared from "../../../shared/Board.module.css";
import type { NumpuzPuzzle } from "./puzzle";
import { checkGuess, operators, type CheckResult, type Operator } from "./rules-check";
import { text } from "../../../text/en";

const words = text.numpuz;

// An empty blank shows this on the screen.
const emptyBlank = "?";

type Guess = (Operator | null)[];

// The status text tells the user what to do next, or what the last check found.
// A null means the user has not pressed Check since the last change.
function statusText(checked: CheckResult | null): string {
  if (checked === null) return words.status.start;
  if (checked === "incomplete") return words.status.incomplete;
  if (checked === "wrong") return words.status.wrong;
  return words.status.solved;
}

type BlankProps = {
  operator: Operator | null;
  position: number;
  isSelected: boolean;
  isSolved: boolean;
  onSelect: () => void;
};

// Each blank is a button so the user can select it.
function BlankButton({ operator, position, isSelected, isSolved, onSelect }: BlankProps) {
  const label = words.blank({
    position,
    operator: operator === null ? "" : words.operatorNames[operator],
  });
  return h(
    "button",
    {
      type: "button",
      className: styles.blank,
      "data-file": operator !== null,
      "data-isSelected": isSelected,
      "aria-label": label,
      "aria-pressed": isSelected,
      "aria-disabled": isSolved,
      onClick: () => {
        if (!isSolved) onSelect();
      },
    },
    h(
      "span",
      { "aria-hidden": true },
      operator === null ? emptyBlank : words.operatorSymbols[operator],
    ),
  );
}

type KeyProps = {
  operator: Operator;
  isDisabled: boolean;
  onPress: () => void;
};

// Each operator key puts its operator in the selected blank.
function OperatorKey({ operator, isDisabled, onPress }: KeyProps) {
  return h(
    "button",
    {
      type: "button",
      className: `${shared.button} ${shared.boxed} ${styles.key}`,
      "aria-label": words.key(words.operatorNames[operator]),
      "aria-disabled": isDisabled,
      onClick: () => {
        if (!isDisabled) onPress();
      },
    },
    h("span", { "aria-hidden": true }, words.operatorSymbols[operator]),
  );
}

type BoardViewProps = {
  numbers: readonly number[];
  target: number;
  guess: Guess;
  selected: number | null;
  checked: CheckResult | null;
  onSelectBlank: (index: number) => void;
  onPressKey: (operator: Operator) => void;
  onCheck: () => void;
};

type EquationProps = {
  numbers: readonly number[];
  target: number;
  guess: Guess;
  selected: number | null;
  isSolved: boolean;
  onSelectBlank: (index: number) => void;
};

// The equation shows the numbers, the blanks between them, and the target.
function Equation({ numbers, target, guess, selected, isSolved, onSelectBlank }: EquationProps) {
  return h(
    "fieldset",
    { className: shared.board },
    h("legend", { className: "visually-hidden" }, words.boardLabel),
    h(
      "div",
      { className: styles.equation },
      ...numbers.map((number, index) =>
        h(
          Fragment,
          { key: index },
          h("span", { className: styles.number }, number),
          index < guess.length
            ? h(BlankButton, {
                operator: guess[index] ?? null,
                position: index + 1,
                isSelected: selected === index,
                isSolved,
                onSelect: () => onSelectBlank(index),
              })
            : null,
        ),
      ),
    ),
    h("p", { className: styles.target }, words.target(target)),
  );
}

type KeysProps = {
  isDisabled: boolean;
  onPressKey: (operator: Operator) => void;
};

// The four operator keys are in one row.
function OperatorKeys({ isDisabled, onPressKey }: KeysProps) {
  return h(
    "div",
    { className: styles.keys },
    ...operators.map((operator) =>
      h(OperatorKey, {
        key: operator,
        operator,
        isDisabled,
        onPress: () => onPressKey(operator),
      }),
    ),
  );
}

function BoardView({
  numbers,
  target,
  guess,
  selected,
  checked,
  onSelectBlank,
  onPressKey,
  onCheck,
}: BoardViewProps) {
  const isSolved = checked === "correct";
  return h(
    "div",
    { className: shared.game },
    h(Equation, { numbers, target, guess, selected, isSolved, onSelectBlank }),
    h(OperatorKeys, { isDisabled: selected === null || isSolved, onPressKey }),
    h(
      "output",
      {
        className: `${shared.status} ${styles.status}`,
        "data-solved": isSolved,
        "data-wrong": checked === "wrong",
      },
      statusText(checked),
    ),
    h(
      "button",
      {
        type: "button",
        className: `${shared.button} ${shared.boxed}`,
        disabled: isSolved,
        onClick: onCheck,
      },
      words.checkButton,
    ),
  );
}

type LogMeta = Pick<NumpuzPuzzle, "id" | "type" | "difficulty">;

function useLifecycleLog(log: ReturnType<typeof getLogger>, meta: LogMeta, isSolved: boolean) {
  const solvedLogged = useRef(false);
  useEffect(() => {
    log.info("Puzzle started", meta);
  }, [log, meta]);

  useEffect(() => {
    if (!isSolved || solvedLogged.current) return;
    solvedLogged.current = true;
    log.info("Puzzle solved", meta);
  }, [isSolved, log, meta]);
}

// The board stores the guess, the selected blank, and the result of the last check.
// The result is cleared when the guess changes, so an old message never stays on screen.
export function Board({ puzzle }: { puzzle: NumpuzPuzzle }) {
  const [guess, setGuess] = useState<Guess>(() =>
    Array.from({ length: puzzle.numbers.length - 1 }, () => null),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<CheckResult | null>(null);

  const log = useMemo(() => getLogger("game.numpuz"), []);
  const meta = useMemo<LogMeta>(
    () => ({ id: puzzle.id, type: puzzle.type, difficulty: puzzle.difficulty }),
    [puzzle.id, puzzle.type, puzzle.difficulty],
  );
  useLifecycleLog(log, meta, checked === "correct");

  function onPressKey(operator: Operator) {
    if (selected === null) return;
    log.debug("Blank changed", { ...meta, index: selected, from: guess[selected], to: operator });
    setGuess(guess.with(selected, operator));
    setChecked(null);
    // Move on to the next empty blank, if there is one.
    const nextEmpty = guess.findIndex((op, index) => index > selected && op === null);
    if (nextEmpty !== -1) setSelected(nextEmpty);
  }

  function onCheck() {
    const result = checkGuess(puzzle.numbers, guess, puzzle.target);
    log.info("Check pressed", { ...meta, result });
    setChecked(result);
  }

  return h(BoardView, {
    numbers: puzzle.numbers,
    target: puzzle.target,
    guess,
    selected,
    checked,
    onSelectBlank: setSelected,
    onPressKey,
    onCheck,
  });
}
