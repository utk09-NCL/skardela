import { levels, type Difficulty } from "./difficulty";

// All puzzle types have these fields. Each type adds its own board data.
export type PuzzleBase = {
  readonly id: string;
  readonly difficulty: Difficulty;
  readonly author: string;
  readonly license: "CC-BY-4.0";
};

// The ID of a puzzle: its type, its level and its number, for example "tilt-hard-1049".
// The number is a day number or the number of a random puzzle. See "src/app/daily.ts".
export function puzzleIdOf(type: string, level: Difficulty, number: number): string {
  return `${type}-${level}-${number}`;
}

// The number has no zeros before it, so each puzzle has only one ID.
const idForm = new RegExp(`^(.+)-(${levels.join("|")})-(0|[1-9]\\d*)$`, "u");

// The parts of a puzzle ID, or "null" for a text that does not have the form of an ID.
export function parsePuzzleId(
  id: string,
): { type: string; level: Difficulty; number: number } | null {
  const [, type, level, number] = idForm.exec(id) ?? [];
  if (type === undefined || level === undefined || number === undefined) return null;
  return { type, level: level as Difficulty, number: Number(number) };
}
