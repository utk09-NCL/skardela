import {
  checkLetter,
  isPlayable,
  isSolved,
  keyHints,
  nextOpenSquare,
  nextSquareInWord,
  type Guess,
  type Guesses,
  type KeyHint,
  type Move as LetterMove,
} from "./rules-check";

// The state machine of a Guzzle game. It is pure: no React, no logs and no other side effects.
// "transition" is the only way to change a game. It gets a state and an event, and it gives the next state.
// When the event is not possible in the state, it gives the same state object back.
// The UI uses "useReducer" with "transition", so each event applies to the latest state.

// "bank" shows the letters of the answer. "noBank" shows all letters from A to Z.
// The machine owns the list of modes. The text in "src/text/en/guzzle.ts" gives only their names.
export const modes = ["bank", "noBank"] as const;
export type Mode = (typeof modes)[number];

// The answer and the size of the board. They do not change during a game.
export type GameConfig = { readonly answer: readonly string[]; readonly size: number };

// A move is an event that changed the game in a way that the board logs.
// A select only moves the selection, thus it is not a move.
export type Move =
  | { readonly type: "mode"; readonly mode: Mode }
  | (LetterMove & { readonly type: "letter"; readonly mistakes: number });

export type GameState = {
  readonly config: GameConfig;
  readonly mode: Mode | null;
  readonly guesses: Guesses;
  // The square that gets the letter of a letter key. "null": no square, for example after the solve.
  readonly selected: number | null;
  readonly mistakes: number;
  // All moves, in order. A new move goes at the end, and no move changes after that.
  readonly moves: readonly Move[];
};

// "chooseMode": the player selects a mode. "select": the player selects a square.
// "putLetter": the player selects a letter key. The letter goes in the selected square.
// "typeLetter": the player types a letter on a square with the keyboard. The letter goes in that square.
export type GameEvent =
  | { readonly type: "chooseMode"; readonly mode: Mode }
  | { readonly type: "select"; readonly index: number }
  | { readonly type: "putLetter"; readonly letter: string }
  | { readonly type: "typeLetter"; readonly index: number; readonly letter: string };

// "choosing": the player must select a mode. "playing": the player puts letters. "solved": all squares are green.
// The phase comes from the state, thus it always matches the guesses.
export type Phase = "choosing" | "playing" | "solved";

export function initialState(config: GameConfig): GameState {
  return {
    config,
    mode: null,
    guesses: Array.from<Guess | undefined>({ length: config.answer.length }),
    selected: null,
    mistakes: 0,
    moves: [],
  };
}

export function phaseOf(state: GameState): Phase {
  if (state.mode === null) return "choosing";
  return isSolved(state.config.answer, state.guesses) ? "solved" : "playing";
}

// The transition table: the events that each phase accepts. This table is the only place with this rule.
// The selectors and "transition" both read it. TypeScript makes sure that each phase has a value for each event.
//
//   choosing --chooseMode--> playing (the first open square is selected)
//   playing  --select, putLetter, typeLetter--> playing, or solved when the last square is green
//   solved: final. It accepts no event.
const accepts: Record<Phase, Record<GameEvent["type"], boolean>> = {
  choosing: { chooseMode: true, select: false, putLetter: false, typeLetter: false },
  playing: { chooseMode: false, select: true, putLetter: true, typeLetter: true },
  solved: { chooseMode: false, select: false, putLetter: false, typeLetter: false },
};

// The letter moves, for the key hints and the status text.
function letterMoves(state: GameState): LetterMove[] {
  return state.moves.filter((move) => move.type === "letter");
}

// The selectors below give the information that the UI shows. "transition" uses the same selectors,
// thus the UI and the machine always agree. The tests check this for each square in many states.

// The last letter move, or "null" before the first letter. The status text tells its result.
export function lastLetter(state: GameState): LetterMove | null {
  return letterMoves(state).at(-1) ?? null;
}

// What the player knows about each letter for the selected square. See "keyHints".
export function hintsFor(state: GameState): Map<string, KeyHint> {
  return state.selected === null
    ? new Map()
    : keyHints(state.config.answer, letterMoves(state), state.selected);
}

export function canChooseMode(state: GameState): boolean {
  return accepts[phaseOf(state)].chooseMode;
}

// A square that is on a word and is not green yet.
function isOpen(state: GameState, index: number): boolean {
  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < state.guesses.length &&
    isPlayable(index, state.config.size) &&
    state.guesses[index]?.mark !== "correct"
  );
}

export function canSelect(state: GameState, index: number): boolean {
  return accepts[phaseOf(state)].select && isOpen(state, index);
}

// The letter keys work when a square is selected.
export function canUseKeys(state: GameState): boolean {
  return accepts[phaseOf(state)].putLetter && state.selected !== null;
}

// A letter from A to Z can go in an open square. The same letter again in the same square does nothing.
function canPutAt(state: GameState, index: number, letter: string): boolean {
  return isOpen(state, index) && /^[A-Z]$/u.test(letter) && state.guesses[index]?.letter !== letter;
}

// "true" when the letter key puts the letter in the selected square.
export function canPutLetter(state: GameState, letter: string): boolean {
  return canUseKeys(state) && state.selected !== null && canPutAt(state, state.selected, letter);
}

// "true" when the typed letter goes in the square.
export function canTypeLetter(state: GameState, index: number, letter: string): boolean {
  return accepts[phaseOf(state)].typeLetter && canPutAt(state, index, letter);
}

// A green letter adds no mistake. A letter that the player already knows is wrong for the square
// adds no mistake too, because it does not give new information.
function mistakesAfter(
  mistakes: number,
  guess: Guess,
  hints: ReadonlyMap<string, KeyHint>,
): number {
  return guess.mark === "correct" || hints.get(guess.letter) === "wrong" ? mistakes : mistakes + 1;
}

// After the mode, the first open square is selected, so the player can type at once.
function chooseMode(state: GameState, mode: Mode): GameState {
  return {
    ...state,
    mode,
    selected: nextOpenSquare(state.guesses, -1, state.config.size),
    moves: [...state.moves, { type: "mode", mode }],
  };
}

// This puts a letter in a square and checks it. After a green letter, the next open square of the same word
// is selected, in the reading direction of the word. See "nextSquareInWord".
// After a letter that is not green, the square stays selected, so the player can try again.
function putAt(state: GameState, index: number, letter: string): GameState {
  const { answer, size } = state.config;
  const hints = keyHints(answer, letterMoves(state), index);
  const guess: Guess = { letter, mark: checkLetter(answer, index, letter) };
  const guesses = state.guesses.with(index, guess);
  const mistakes = mistakesAfter(state.mistakes, guess, hints);
  return {
    ...state,
    guesses,
    mistakes,
    selected: guess.mark === "correct" ? nextSquareInWord(guesses, index, size) : index,
    moves: [...state.moves, { type: "letter", index, guess, mistakes }],
  };
}

// The only way to change a game. An event that is not possible gives the same state object back,
// so React does not render again.
export function transition(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "chooseMode":
      return canChooseMode(state) ? chooseMode(state, event.mode) : state;
    case "select":
      return canSelect(state, event.index) ? { ...state, selected: event.index } : state;
    case "putLetter": {
      const index = state.selected;
      return index !== null && canPutLetter(state, event.letter)
        ? putAt(state, index, event.letter)
        : state;
    }
    case "typeLetter":
      return canTypeLetter(state, event.index, event.letter)
        ? putAt(state, event.index, event.letter)
        : state;
  }
}
