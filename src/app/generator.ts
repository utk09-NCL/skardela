import type { Difficulty } from "../shared/difficulty";
import { puzzleIdOf } from "../shared/puzzle";
import type { PuzzleMap, PuzzleType } from "./puzzle-types/registry";

// The browser makes each puzzle from its ID, in a worker. Thus the search for a good board does not stop the page.
// "generator.worker.ts" is the worker. The tests use "makePuzzle" directly, because jsdom has no workers.
// See "src/test/setup.ts".

export type GeneratorRequest = {
  readonly type: PuzzleType;
  readonly level: Difficulty;
  readonly number: number;
};

// The worker sends the puzzle, or the text of the error that stopped it.
export type GeneratorReply =
  | { readonly puzzle: PuzzleMap[PuzzleType] }
  | { readonly error: string };

// One worker for the session. It starts at the first request.
let worker: Worker | undefined;

// The puzzles of this session, by ID. A return to a puzzle gives the same promise, thus the worker
// does not make the puzzle again, and React shows the board at once. A request that failed is not in the list.
const requests = new Map<string, Promise<PuzzleMap[PuzzleType]>>();

function askWorker(request: GeneratorRequest): Promise<PuzzleMap[PuzzleType]> {
  worker ??= new Worker(new URL("./generator.worker.ts", import.meta.url), { type: "module" });
  const current = worker;
  const { port1, port2 } = new MessageChannel();
  return new Promise((resolve, reject) => {
    // Each request has its own channel. Thus a reply cannot go to a different request.
    port1.addEventListener("message", ({ data }: MessageEvent<GeneratorReply>) => {
      port1.close();
      if ("puzzle" in data) resolve(data.puzzle);
      else reject(new Error(data.error));
    });
    port1.start();
    // A worker that cannot load sends no reply. Its error stops each request that waits,
    // and the next request starts a new worker.
    current.addEventListener("error", (event) => {
      if (worker === current) worker = undefined;
      reject(new Error(event.message));
    });
    current.postMessage(request, [port2]);
  });
}

// The puzzle of a type, a level and a number. The same values always give the same puzzle.
export function requestPuzzle<Type extends PuzzleType>(
  type: Type,
  level: Difficulty,
  number: number,
): Promise<PuzzleMap[Type]> {
  const id = puzzleIdOf(type, level, number);
  let request = requests.get(id);
  if (request === undefined) {
    request = askWorker({ type, level, number });
    requests.set(id, request);
    // After a failure, the next request for this puzzle asks the worker again.
    request.catch(() => {
      requests.delete(id);
    });
  }
  // The ID has the type, thus the puzzle of this ID is a puzzle of this type.
  return request as Promise<PuzzleMap[Type]>;
}
