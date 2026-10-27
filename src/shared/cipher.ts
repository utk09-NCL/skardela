// "vite.config.ts" also imports this file. Vite loads the config with native imports,
// and native imports need the file extension.
import { makeRandom } from "./random.ts";

// The puzzle files go to the browser over the network, and the browser tools can show them.
// This cipher hides the answers, so a player does not see an answer by accident.
// It is not security. The browser must decode the answer to check the moves of the player.
//
// The cipher is a stream cipher. The puzzle ID gives the seed, so each puzzle gets a different key.
// Each byte of the text gets XOR with one random byte of the key. Base64 then makes the bytes into text.
// The same function encodes and decodes, because (byte XOR key) XOR key gives the byte again.

// FNV-1a hash. It changes a text into a 32-bit number, so a puzzle ID can be a seed.
function seedOf(text: string): number {
  let hash = 0x81_1c_9d_c5;
  for (const byte of new TextEncoder().encode(text)) {
    hash = Math.imul(hash ^ byte, 0x01_00_01_93);
  }
  return hash >>> 0;
}

function xorWithKey(bytes: Uint8Array, id: string): Uint8Array {
  const random = makeRandom(seedOf(id));
  return bytes.map((byte) => byte ^ Math.floor(random() * 256));
}

export function encodeText(text: string, id: string): string {
  const bytes = xorWithKey(new TextEncoder().encode(text), id);
  return btoa(String.fromCodePoint(...bytes));
}

export function decodeText(code: string, id: string): string {
  const bytes = Uint8Array.from(atob(code), (character) => character.codePointAt(0) ?? 0);
  return new TextDecoder().decode(xorWithKey(bytes, id));
}

// The answer rows have only letters, "." and the Numpuz operators (+ - × ÷), thus "/" can join them into one text.
const rowBreak = "/";

type WithAnswer = { readonly id: string; readonly answer: readonly string[] };

// A puzzle as the browser gets it: the field "code" has the ciphered answer.
export type Ciphered<Puzzle extends WithAnswer> = Omit<Puzzle, "answer"> & {
  readonly id: string;
  readonly code: string;
};

// The Vite plugin in "vite.config.ts" uses this function when it loads a file in "puzzles/".
export function cipherAnswer<Puzzle extends WithAnswer>(puzzle: Puzzle): Ciphered<Puzzle> {
  const { answer, ...rest } = puzzle;
  return { ...rest, code: encodeText(answer.join(rowBreak), puzzle.id) };
}

export function decipherAnswer<Puzzle extends WithAnswer>(puzzle: Ciphered<Puzzle>): Puzzle {
  const { code, ...rest } = puzzle;
  const answer = decodeText(code, puzzle.id).split(rowBreak);
  // TypeScript cannot see that "rest" and "answer" together make a full puzzle, thus the cast.
  return { ...rest, answer } as unknown as Puzzle;
}

// TypeScript reads the type of a puzzle file from the readable file in "puzzles/".
// But the Vite plugin ciphers the file before the app gets it. Thus the data comes in as "unknown".
export function decipherPuzzles<Puzzle extends WithAnswer>(file: unknown): Puzzle[] {
  return (file as readonly Ciphered<Puzzle>[]).map((puzzle) => decipherAnswer(puzzle));
}
