import { lazy, type ComponentType } from "react";
import type { PuzzleMap, PuzzleType } from "./registry";

// The board component of each puzzle type.
// A board loads only when the user opens a puzzle. This keeps the first page load small.
export const boards: { [Type in PuzzleType]: ComponentType<{ puzzle: PuzzleMap[Type] }> } = {
  "colour-binary": lazy(() =>
    import("./colour-binary/Board").then((module) => ({ default: module.Board })),
  ),
  guzzle: lazy(() => import("./guzzle/Board").then((module) => ({ default: module.Board }))),
  latics: lazy(() => import("./latics/Board").then((module) => ({ default: module.Board }))),
  numpuz: lazy(() => import("./numpuz/Board").then((module) => ({ default: module.Board }))),
};
