import { describe, expect, it } from "vitest";
import { levels, type Difficulty } from "../../../shared/difficulty";
import { baseOf } from "../../../test/puzzle-base";
import { makePuzzle } from "../registry";
import { candidate, materialsOf, type Material } from "./candidate";
import { generate, isGoodPuzzle, materialOf } from "./generator";
import { findPuzzleProblems, levelRules, toSquares, type LaticsPuzzle } from "./puzzle";
import { findSolutionProblems } from "./solver";

// The candidates of the first seeds that are a puzzle. A seed gives no puzzle when a piece has no place on the path.
function candidates(level: Difficulty, material: Material): LaticsPuzzle[] {
  return Array.from({ length: 300 }, (_, seed) =>
    candidate(seed + 1, baseOf("latics", level), material),
  ).filter((puzzle) => puzzle !== null);
}

// The pieces that a board of each material must have.
const pieces: Record<Material, (puzzle: LaticsPuzzle) => boolean> = {
  water: (puzzle) => puzzle.water !== undefined,
  critical: (puzzle) => puzzle.water !== undefined && puzzle.lasers.length === 2,
  prism: (puzzle) => ["^", "R", "B"].every((piece) => puzzle.board.join("").includes(piece)),
  filter: (puzzle) => /[rb]/u.test(puzzle.board.join("")) && /[RB]/u.test(puzzle.board.join("")),
};

// The boards of day 1049. See the last test.
const day1049 = [
  [
    "easy",
    {
      board: [".|..#", "-...#", ".b...", "..L.\\", "...B."],
      lasers: [{ direction: "NW", colour: "white" }],
      tray: 0,
    },
  ],
  [
    "medium",
    {
      board: ["#..#...", ".#...B.", "-./..b#", ".|.L.|#", "r..#...", "......R", "...|.L."],
      lasers: [
        { direction: "E", colour: "white" },
        { direction: "W", colour: "red" },
      ],
      tray: 1,
    },
  ],
  [
    "hard",
    {
      board: [
        ".........",
        "........#",
        "##.......",
        "./-...../",
        "...|.....",
        "|.|..L.#.",
        "..L......",
        "....M.M#.",
        ".........",
      ],
      lasers: [
        { direction: "S", colour: "white" },
        { direction: "SW", colour: "white" },
      ],
      tray: 1,
      water: [
        ".........",
        ".........",
        ".........",
        ".........",
        ".....~~..",
        ".....~~..",
        ".....~~..",
        ".....~~..",
        ".........",
      ],
    },
  ],
] as const;

describe("latics generator materials", () => {
  it("gives each material of a level in turn, and the critical angle only on hard", () => {
    expect([0, 1, 2, 3].map((number) => materialOf("easy", number))).toEqual([
      "water",
      "prism",
      "filter",
      "water",
    ]);
    expect([0, 1, 2, 3].map((number) => materialOf("hard", number))).toEqual([
      "water",
      "critical",
      "prism",
      "filter",
    ]);
  });
});

describe("latics generator boards", () => {
  it.each(levels)("builds %s boards with valid data and the pieces of the material", (level) => {
    for (const material of materialsOf(level)) {
      const found = candidates(level, material);
      expect(found.length).toBeGreaterThan(0);
      expect(found.flatMap((puzzle) => findPuzzleProblems(puzzle))).toEqual([]);
      expect(found.filter((puzzle) => !pieces[material](puzzle))).toEqual([]);
    }
  });

  // The builder takes the tray mirrors back to the tray, thus each number of the level is a possible tray.
  it("gives a tray of the level", () => {
    for (const level of levels) {
      const { min, max } = levelRules[level].tray;
      const trays = candidates(level, "prism").map((puzzle) => puzzle.tray);
      expect(Math.min(...trays)).toBe(min);
      expect(Math.max(...trays)).toBe(max);
    }
  });

  it("builds the same board for the same seed", () => {
    expect(candidate(12, baseOf("latics", "medium"), "filter")).toEqual(
      candidate(12, baseOf("latics", "medium"), "filter"),
    );
  });
});

describe("latics generator puzzles", () => {
  // The numbers 4 to 7 give each material of each level.
  it.each(levels)(
    "makes %s puzzles that pass all data checks, with the fields of the ID",
    (level) => {
      for (const number of [4, 5, 6, 7]) {
        const base = baseOf("latics", level, number);
        const puzzle = generate(base, number);
        expect(puzzle).toMatchObject({ ...base, type: "latics" });
        expect([...findPuzzleProblems(puzzle), ...findSolutionProblems(puzzle)]).toEqual([]);
        expect(isGoodPuzzle(puzzle, materialOf(level, number))).toBe(true);
        expect(pieces[materialOf(level, number)](puzzle)).toBe(true);
        // The start has mirrors to turn.
        expect(toSquares(puzzle.board).some((square) => "-/|\\".includes(square))).toBe(true);
      }
    },
  );

  it("makes the same puzzle again for the same ID", () => {
    expect(generate(baseOf("latics", "hard", 5), 5)).toEqual(
      generate(baseOf("latics", "hard", 5), 5),
    );
  });

  // The board of a day must not change, because each player of that day gets the same puzzle.
  // A change to the generator or to the rules that changes these boards changes the puzzles of each day.
  it.each(day1049)("makes the fixed %s board of day 1049", async (level, board) => {
    expect(await makePuzzle("latics", level, 1049)).toMatchObject(board);
  });
});
