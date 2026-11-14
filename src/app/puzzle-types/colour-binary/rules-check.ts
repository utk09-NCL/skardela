import { positionOf } from "../../../shared/grid";
import type { Square } from "./puzzle";

export function lines(squares: readonly Square[]): string[] {
  const size = Math.sqrt(squares.length);
  const all = Array.from({ length: size }, (_, index) => index);
  const rows = all.map((row) => all.map((column) => squares[row * size + column]).join(""));
  const columns = all.map((column) => all.map((row) => squares[row * size + column]).join(""));
  return [...rows, ...columns];
}

export function count(line: string, colour: Square): number {
  return line.split(colour).length - 1;
}

export function isPossible(line: string): boolean {
  const half = line.length / 2;
  return count(line, "R") <= half && count(line, "B") <= half && !/RRR|BBB/u.test(line);
}

export function obeysRules(squares: readonly Square[]): boolean {
  return !squares.includes(".") && lines(squares).every((line) => isPossible(line));
}

export const nextSquare: Record<Square, Square> = { ".": "R", R: "B", B: "." };

// A rule that a square breaks in its row or its column.
// "half": the line has more than half of its squares in this colour. "three": the square is one of three squares
// of this colour next to each other.
export type BrokenRule = {
  readonly reason: "half" | "three";
  readonly line: "row" | "column";
  // The number of the row or the column, from 1.
  readonly number: number;
  readonly colour: "R" | "B";
};

// The first rule that the colour of the square at "index" breaks: first in its row, then in its column.
// In each line, "half" comes before "three". An empty square breaks no rule.
// The board tells the player this rule after a change. The hint uses it to find a square with one colour only.
export function brokenRuleAt(squares: readonly Square[], index: number): BrokenRule | undefined {
  const colour = squares[index];
  if (colour !== "R" && colour !== "B") return undefined;
  const size = Math.sqrt(squares.length);
  const all = lines(squares);
  const { row, column } = positionOf(index, size);
  // "position" is the place of the square in the line.
  const own = [
    { line: "row", number: row + 1, text: all[row] ?? "", position: column },
    { line: "column", number: column + 1, text: all[size + column] ?? "", position: row },
  ] as const;
  for (const { line, number, text, position } of own) {
    if (count(text, colour) > size / 2) return { reason: "half", line, number, colour };
    // Three squares next to each other that include this square are in the 5 squares around it.
    // Three squares at a different place in the line are not a rule that this square breaks.
    const around = text.slice(Math.max(0, position - 2), position + 3);
    if (around.includes(colour.repeat(3))) return { reason: "three", line, number, colour };
  }
  return undefined;
}
