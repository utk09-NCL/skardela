// "vite.config.ts" also imports this file. Vite loads the config with native imports,
// and native imports need the file extension.
import LZString from "lz-string";
import { makeRandom, seedOf } from "./random.ts";

// The word bank of Guzzle goes to the browser over the network, and the browser tools can show it.
// This cipher hides the words and the clues, so a player does not see an answer by accident.
// It is not security. The browser must decode the bank to make a puzzle.
//
// lz-string compresses the text first, because ciphered text does not compress.
// Then a stream cipher changes each byte: the byte gets XOR with one random byte of a fixed key.
// Base64 then makes the bytes into text. The same XOR decodes, because (byte XOR key) XOR key gives the byte again.

function xorWithKey(bytes: Uint8Array): Uint8Array {
  const random = makeRandom(seedOf("skardela"));
  return bytes.map((byte) => byte ^ Math.floor(random() * 256));
}

// The Vite plugin in "vite.config.ts" uses this function when it loads the word bank.
export function cipherText(text: string): string {
  const bytes = xorWithKey(LZString.compressToUint8Array(text));
  // One character for each byte. A spread of all bytes into one call can be too long for a browser.
  return btoa(Array.from(bytes, (byte) => String.fromCodePoint(byte)).join(""));
}

export function decipherText(code: string): string {
  const bytes = Uint8Array.from(atob(code), (character) => character.codePointAt(0) ?? 0);
  return LZString.decompressFromUint8Array(xorWithKey(bytes));
}
