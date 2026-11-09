import { app } from "./app";
import { colourBinary } from "./colour-binary";
import { guzzle } from "./guzzle";
import { home } from "./home";
import { latics } from "./latics";
import { puzzlePage } from "./puzzle-page";
import { numpuz } from "./numpuz";
import { orbital } from "./orbital";
import { tilt } from "./tilt";

// All UI text in English. These are the i18next resources of English. See "src/i18n/config.ts".
// The code reads a text with "t", for example t("home.hero.title").
// Each part of the app has its own file in this folder. This file puts the parts together.
// A puzzle type has its text under its own name, for example t("colour-binary.name").
// To add a puzzle type, make a file with its text, and add it below with the name of the puzzle type.
// Then add the same text in each other language, for example in "src/text/hi/".
export const en = {
  ...app,
  home,
  puzzlePage,
  "colour-binary": colourBinary,
  guzzle,
  latics,
  numpuz,
  orbital,
  tilt,
};

// The shape of the text of a language: the same keys as English, with a text of the language in each string.
type Translation<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly Translation<Item>[]
    : { readonly [Key in keyof T]: Translation<T[Key]> };

export type TextResource = Translation<typeof en>;
