import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratorReply, GeneratorRequest } from "./generator";

// "src/test/setup.ts" replaces "generator.ts" for all tests, because jsdom has no workers.
// These tests use the real file, with a worker that the test controls.
vi.unmock("./generator");

// The workers that the code made, and the port of each request.
const workers: FakeWorker[] = [];

class FakeWorker extends EventTarget {
  readonly requests: { request: GeneratorRequest; port: MessagePort }[] = [];

  constructor() {
    super();
    workers.push(this);
  }

  postMessage(request: GeneratorRequest, [port]: MessagePort[]) {
    if (port !== undefined) this.requests.push({ request, port });
  }
}

// The real file with no worker and no puzzles, as at the start of a session.
function loadGenerator() {
  vi.resetModules();
  return import("./generator");
}

// A reply with a puzzle that has only its ID. The code of these tests does not read the board.
function puzzleReply(id: string) {
  return { puzzle: { id } } as GeneratorReply;
}

// The reply of a worker to the request at "position". The first worker is the worker 0.
function reply(position: number, message: GeneratorReply, worker = 0) {
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a message port has no target origin.
  workers[worker]?.requests[position]?.port.postMessage(message);
}

beforeEach(() => {
  workers.length = 0;
  vi.stubGlobal("Worker", FakeWorker);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestPuzzle", () => {
  it("asks one worker for each puzzle, and gives the puzzle of its reply", async () => {
    const { requestPuzzle } = await loadGenerator();
    const easy = requestPuzzle("tilt", "easy", 7);
    const hard = requestPuzzle("tilt", "hard", 7);
    expect(workers).toHaveLength(1);
    expect(workers[0]?.requests.map(({ request }) => request)).toEqual([
      { type: "tilt", level: "easy", number: 7 },
      { type: "tilt", level: "hard", number: 7 },
    ]);
    // The replies come in a different order. Each request has its own port, thus each one gets its puzzle.
    reply(1, puzzleReply("tilt-hard-7"));
    reply(0, puzzleReply("tilt-easy-7"));
    expect(await hard).toEqual({ id: "tilt-hard-7" });
    expect(await easy).toEqual({ id: "tilt-easy-7" });
  });

  it("does not ask again for a puzzle of this session", async () => {
    const { requestPuzzle } = await loadGenerator();
    expect(requestPuzzle("tilt", "easy", 7)).toBe(requestPuzzle("tilt", "easy", 7));
    expect(workers[0]?.requests).toHaveLength(1);
  });
});

describe("requestPuzzle after a failure", () => {
  it("fails with the error of the reply", async () => {
    const { requestPuzzle } = await loadGenerator();
    const puzzle = requestPuzzle("tilt", "easy", 7);
    reply(0, { error: "No good puzzle." });
    await expect(puzzle).rejects.toThrow("No good puzzle.");
  });

  it("fails when the worker cannot load", async () => {
    const { requestPuzzle } = await loadGenerator();
    const puzzle = requestPuzzle("tilt", "easy", 7);
    workers[0]?.dispatchEvent(new ErrorEvent("error", { message: "The worker did not load." }));
    await expect(puzzle).rejects.toThrow("The worker did not load.");
  });

  // A worker file can fail to load one time, for example when the network drops for a moment.
  it("asks a new worker after the worker failed, also for the puzzle that failed", async () => {
    const { requestPuzzle } = await loadGenerator();
    const failed = requestPuzzle("tilt", "easy", 7);
    workers[0]?.dispatchEvent(new ErrorEvent("error", { message: "The worker did not load." }));
    await expect(failed).rejects.toThrow("The worker did not load.");

    const again = requestPuzzle("tilt", "easy", 7);
    const other = requestPuzzle("tilt", "hard", 7);
    expect(workers).toHaveLength(2);
    expect(workers[1]?.requests.map(({ request }) => request.level)).toEqual(["easy", "hard"]);
    reply(0, puzzleReply("tilt-easy-7"), 1);
    reply(1, puzzleReply("tilt-hard-7"), 1);
    expect(await again).toEqual({ id: "tilt-easy-7" });
    expect(await other).toEqual({ id: "tilt-hard-7" });
  });

  it("asks again for a puzzle after an error reply", async () => {
    const { requestPuzzle } = await loadGenerator();
    const failed = requestPuzzle("tilt", "easy", 7);
    reply(0, { error: "No good puzzle." });
    await expect(failed).rejects.toThrow("No good puzzle.");
    expect(requestPuzzle("tilt", "easy", 7)).not.toBe(failed);
    expect(workers[0]?.requests).toHaveLength(2);
  });
});
