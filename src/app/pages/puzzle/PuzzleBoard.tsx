import { use, type ComponentType } from "react";
import { boards } from "../../puzzle-types/boards";
import type { PuzzleMap, PuzzleType } from "../../puzzle-types/registry";

// This shows the board of the puzzle type. The type of "puzzle" always fits the board.
// The worker makes the puzzle. "use" waits for it: the "Suspense" of the page shows a message until then,
// and the "ErrorBoundary" of the page shows a message if the worker fails.
export function PuzzleBoard<Type extends PuzzleType>({
  type,
  puzzle,
}: {
  type: Type;
  puzzle: Promise<PuzzleMap[Type]>;
}) {
  const Board: ComponentType<{ puzzle: PuzzleMap[Type] }> = boards[type];
  return <Board puzzle={use(puzzle)} />;
}
