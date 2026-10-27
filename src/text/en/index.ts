import { app } from "./app";
import { colourBinary } from "./colour-binary";
import { guzzle } from "./guzzle";
import { home } from "./home";
import { latics } from "./latics";
import { puzzlePage } from "./puzzle-page";
import { numpuz } from "./numpuz";

// All UI text in English. Import it from "src/text/en": the code uses "text.home.hero.title", for example.
// Each part of the app has its own file in this folder. This file puts the parts together.
// A puzzle type has its text under its own name, for example text["colour-binary"].
// To add a puzzle type, make a file with its text, and add it below with the name of the puzzle type.
export const text = {
  ...app,
  home,
  puzzlePage,
  "colour-binary": colourBinary,
  guzzle,
  latics,
  numpuz,
};
