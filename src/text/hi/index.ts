import type { TextResource } from "../en";
import { app } from "./app";
import { colourBinary } from "./colour-binary";
import { guzzle } from "./guzzle";
import { home } from "./home";
import { latics } from "./latics";
import { puzzlePage } from "./puzzle-page";
import { numpuz } from "./numpuz";
import { orbital } from "./orbital";
import { tilt } from "./tilt";

// All UI text in Hindi. It has the same keys as the English text in "src/text/en/".
// TypeScript shows an error when a key is missing here.
export const hi = {
  ...app,
  home,
  puzzlePage,
  "colour-binary": colourBinary,
  guzzle,
  latics,
  numpuz,
  orbital,
  tilt,
} satisfies TextResource;
