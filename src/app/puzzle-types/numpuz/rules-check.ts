export type Operator = "+" | "-" | "×" | "÷";

export const operators: readonly Operator[] = ["+", "-", "×", "÷"];

export type CheckResult = "incomplete" | "correct" | "wrong";

/** Works out the answer. Returns null if it cannot be worked out. */
export function evaluate(numbers: readonly number[], ops: readonly Operator[]): number | null {
  const first = numbers[0];
  if (first === undefined || ops.length !== numbers.length - 1) return null;

  let total = 0;
  let sign = 1;
  let current = first;

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const next = numbers[i + 1];
    if (op === undefined || next === undefined) return null;

    if (op === "×") {
      current *= next;
    } else if (op === "÷") {
      if (next === 0) return null;
      current /= next;
    } else {
      total += sign * current;
      sign = op === "+" ? 1 : -1;
      current = next;
    }
  }

  return total + sign * current;
}

/** Checks the player's guess. A null means the blank is still empty. */
export function checkGuess(
  numbers: readonly number[],
  guess: readonly (Operator | null)[],
  target: number,
): CheckResult {
  const filled = guess.filter((op): op is Operator => op !== null);
  if (filled.length !== guess.length) return "incomplete";

  const result = evaluate(numbers, filled);
  if (result === null) return "wrong";
  return Math.abs(result - target) < 1e-9 ? "correct" : "wrong";
}
