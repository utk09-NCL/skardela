import { describe, expect, it } from "vitest";
import { deepFreeze } from "../../../test/deep-freeze";
import { makeRandom } from "../../../shared/random";
import { puzzleTypes } from "../registry";
import example from "./examples/guzzle-0000.json";
import {
  canChooseMode,
  canPutLetter,
  canSelect,
  canTypeLetter,
  hintsFor,
  initialState,
  lastLetter,
  phaseOf,
  transition,
  type GameEvent,
  type GameState,
  type Mode,
  type Phase,
} from "./machine";
import { toSquares, type GuzzlePuzzle } from "./puzzle";
import { checkLetter, isPlayable } from "./rules-check";

// The example from rules.md: CAT across, BAG down, RAN and MAP on the diagonals. The center is A.
const start = initialState(example);
const modes: readonly Mode[] = ["bank", "noBank"];

// The puzzle file has ciphered answers, thus the tests load it as the app does.
const puzzles: readonly GuzzlePuzzle[] = [
  example as GuzzlePuzzle,
  ...(await puzzleTypes.guzzle.loadPuzzles()),
];

// This helper applies the events one after the other, as "useReducer" does.
function play(state: GameState, events: readonly GameEvent[]): GameState {
  return events.reduce((current, event) => transition(current, event), state);
}

describe("guzzle machine phases", () => {
  it("accepts only a mode before the first move", () => {
    expect(phaseOf(start)).toBe("choosing");
    expect(transition(start, { type: "select", index: 0 })).toBe(start);
    expect(transition(start, { type: "putLetter", letter: "R" })).toBe(start);
    expect(transition(start, { type: "typeLetter", index: 0, letter: "R" })).toBe(start);
    const playing = transition(start, { type: "chooseMode", mode: "noBank" });
    expect(playing).toMatchObject({ mode: "noBank", selected: 0 });
    expect(playing.moves).toEqual([{ type: "mode", mode: "noBank" }]);
  });

  it("does not change the mode after the first choice", () => {
    const playing = transition(start, { type: "chooseMode", mode: "bank" });
    expect(transition(playing, { type: "chooseMode", mode: "noBank" })).toBe(playing);
  });

  it("solves the puzzle and then ignores each event", () => {
    const playing = transition(start, { type: "chooseMode", mode: "bank" });
    // The cursor follows each word: the diagonal from the top left (R, N), the diagonal from the bottom left
    // (M, P), the across word (C, T), then the down word (B, G).
    const solved = play(
      playing,
      [..."RNMPCTBG"].map((letter) => ({ type: "putLetter", letter }) as const),
    );
    expect(phaseOf(solved)).toBe("solved");
    expect(solved).toMatchObject({ selected: null, mistakes: 0 });
    for (const event of [
      { type: "select", index: 0 },
      { type: "putLetter", letter: "A" },
      { type: "typeLetter", index: 0, letter: "A" },
      { type: "chooseMode", mode: "noBank" },
    ] as const) {
      expect(transition(solved, event)).toBe(solved);
    }
  });
});

describe("guzzle machine letters", () => {
  const playing = transition(start, { type: "chooseMode", mode: "noBank" });

  it("puts a typed letter in its own square, not in the selected square", () => {
    // Row 1, column 1 is selected. The player types B on row 1, column 2, where B is correct.
    const typed = transition(playing, { type: "typeLetter", index: 1, letter: "B" });
    expect(typed.guesses[1]).toEqual({ letter: "B", mark: "correct" });
    expect(typed.guesses[0]).toBeUndefined();
    expect(typed.mistakes).toBe(0);
  });

  it("keeps the square selected after a wrong letter, and adds no mistake for a known wrong letter", () => {
    const wrong = play(playing, [
      { type: "putLetter", letter: "T" },
      { type: "putLetter", letter: "N" },
      { type: "putLetter", letter: "T" },
    ]);
    expect(wrong).toMatchObject({ selected: 0, mistakes: 2 });
    expect(hintsFor(wrong).get("T")).toBe("wrong");
    expect(lastLetter(wrong)).toMatchObject({ index: 0, guess: { letter: "T", mark: "absent" } });
  });

  it("ignores a letter that is not from A to Z, a square that is not on a word, and a green square", () => {
    const green = transition(playing, { type: "putLetter", letter: "R" });
    for (const event of [
      { type: "putLetter", letter: "b" },
      { type: "putLetter", letter: "1" },
      { type: "typeLetter", index: 4, letter: "A" },
      { type: "typeLetter", index: 0, letter: "B" },
      { type: "typeLetter", index: 9, letter: "B" },
      { type: "select", index: 0 },
      { type: "select", index: -1 },
      { type: "select", index: 0.5 },
    ] as const) {
      expect(transition(green, event)).toBe(green);
    }
  });
});

// The rules that each state must obey. Each problem is a short text, so a failed test shows which rule broke.
function brokenInvariants(state: GameState): string[] {
  const problems: string[] = [];
  const { answer: letters, size } = state.config;
  for (const [index, guess] of state.guesses.entries()) {
    if (guess === undefined) continue;
    if (!isPlayable(index, size)) problems.push(`square ${index} is not on a word`);
    if (guess.mark !== checkLetter(letters, index, guess.letter))
      problems.push(`square ${index} has a wrong mark`);
  }
  const { selected } = state;
  const isSelectionOpen =
    selected === null ||
    (isPlayable(selected, size) && state.guesses[selected]?.mark !== "correct");
  if (!isSelectionOpen) problems.push("the selected square is not open");
  if (phaseOf(state) !== "playing" && selected !== null) problems.push("a selection outside play");
  const letterMoves = state.moves.filter((move) => move.type === "letter");
  if (state.mistakes !== (letterMoves.at(-1)?.mistakes ?? 0))
    problems.push("the mistakes do not match the moves");
  const modeMoves = state.moves.filter((move) => move.type === "mode");
  const isModeFirst =
    modeMoves.length === (state.mode === null ? 0 : 1) &&
    (state.moves[0]?.type ?? "mode") === "mode";
  if (!isModeFirst) problems.push("the mode is not the first and only mode move");
  return problems;
}

// The rules for one event: the selectors agree with the machine, an accepted event keeps the earlier moves,
// a green square never changes, and the phase "solved" never changes.
function brokenStep(before: GameState, event: GameEvent, after: GameState): string[] {
  const problems: string[] = [];
  const isAccepted = after !== before;
  const allowed: Record<GameEvent["type"], () => boolean> = {
    chooseMode: () => canChooseMode(before),
    select: () => event.type === "select" && canSelect(before, event.index),
    putLetter: () => event.type === "putLetter" && canPutLetter(before, event.letter),
    typeLetter: () =>
      event.type === "typeLetter" && canTypeLetter(before, event.index, event.letter),
  };
  if (isAccepted !== allowed[event.type]())
    problems.push(`${JSON.stringify(event)}: the selector does not agree`);
  const newMoves = event.type === "select" || !isAccepted ? 0 : 1;
  const isHistoryKept =
    after.moves.length === before.moves.length + newMoves &&
    before.moves.every((move, position) => after.moves[position] === move);
  if (!isHistoryKept) problems.push(`${JSON.stringify(event)}: the moves are wrong`);
  const isGreenKept = before.guesses.every(
    (guess, index) => guess?.mark !== "correct" || after.guesses[index] === guess,
  );
  if (!isGreenKept) problems.push("a green square changed");
  if (phaseOf(before) === "solved" && isAccepted) problems.push("an event changed a solved game");
  return problems;
}

// A random event. Many letters are correct, so the games move forward and some games end.
// Some events have a bad index or a bad letter, to test that the machine ignores them.
function randomEvent(state: GameState, random: () => number): GameEvent {
  const pick = <Item>(list: readonly Item[]) => list[Math.floor(random() * list.length)] as Item;
  const length = state.guesses.length;
  const index = pick([...Array.from({ length }, (_, square) => square), -1, length, 0.5]);
  const correct = state.config.answer[state.selected ?? index] ?? "A";
  const letter = pick([correct, correct, "A", "E", "S", "T", "b", "1", ""]);
  const roll = random();
  if (roll < 0.05) return { type: "chooseMode", mode: pick(modes) };
  if (roll < 0.25) return { type: "select", index };
  if (roll < 0.7) return { type: "putLetter", letter };
  return { type: "typeLetter", index, letter: pick([state.config.answer[index] ?? "A", letter]) };
}

// This plays a random game and gives each broken rule, and each phase that the game reached.
function fuzz(puzzle: GuzzlePuzzle, seed: number) {
  const random = makeRandom(seed);
  let state = deepFreeze(initialState(puzzle));
  const problems = brokenInvariants(state);
  const phases = new Set<Phase>([phaseOf(state)]);
  for (let step = 0; step < 250; step += 1) {
    const event = randomEvent(state, random);
    const next = deepFreeze(transition(state, event));
    problems.push(...brokenStep(state, event, next), ...brokenInvariants(next));
    phases.add(phaseOf(next));
    state = next;
  }
  return { problems, phases };
}

describe("guzzle machine rules for each state", () => {
  it("keeps all rules in random games on each puzzle", () => {
    const games = puzzles.flatMap((puzzle, position) =>
      [1, 2, 3].map((seed) => fuzz(puzzle, seed * 7919 + position)),
    );
    expect(games.flatMap((game) => game.problems)).toEqual([]);
    // The random games must reach each phase, else the rules for that phase are not tested.
    expect(new Set(games.flatMap((game) => Array.from(game.phases)))).toEqual(
      new Set(["choosing", "playing", "solved"]),
    );
  });

  it("solves each puzzle in each mode when the player types the answer", () => {
    const results = puzzles.flatMap((puzzle) =>
      modes.map((mode) => {
        const typed = toSquares(puzzle.answer).map(
          (letter, index) => ({ type: "typeLetter", index, letter }) as const,
        );
        const end = play(initialState(puzzle), [{ type: "chooseMode", mode }, ...typed]);
        return { id: puzzle.id, mode, phase: phaseOf(end), mistakes: end.mistakes };
      }),
    );
    expect(results).toEqual(
      puzzles.flatMap(({ id }) =>
        modes.map((mode) => ({ id, mode, phase: "solved", mistakes: 0 })),
      ),
    );
  });
});
