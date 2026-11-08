// React Compiler skips each function that it cannot compile, and the build does not fail.
// The project has no manual memo, thus a skipped component is not memoized at all.
// This check fails when the compiler skips a function in "src/".
import { globSync, readFileSync } from "node:fs";
import { transformAsync } from "@babel/core";
import { expect, it } from "vitest";

type CompilerEvent = {
  kind: string;
  fnLoc?: { start: { line: number } } | null;
  detail?: { reason?: string };
  data?: string;
};

// The events that skip a function: an error in the code, or a crash of the compiler.
const skipKinds = new Set(["CompileError", "PipelineError"]);

// The functions of one file that the compiler skips, as "file:line kind: reason".
// A ".ts" file has no JSX, as in the build, so a generic arrow function such as "<T>(item: T) => item" is correct.
async function skippedFunctions(file: string): Promise<string[]> {
  const skipped: string[] = [];
  const logEvent = (_name: string, event: CompilerEvent) => {
    if (!skipKinds.has(event.kind)) return;
    const reason = event.detail?.reason ?? event.data ?? "";
    skipped.push(`${file}:${event.fnLoc?.start.line ?? 0} ${event.kind}: ${reason}`);
  };
  await transformAsync(readFileSync(file, "utf8"), {
    filename: file,
    babelrc: false,
    configFile: false,
    parserOpts: { plugins: file.endsWith(".tsx") ? ["typescript", "jsx"] : ["typescript"] },
    plugins: [["babel-plugin-react-compiler", { panicThreshold: "none", logger: { logEvent } }]],
  });
  return skipped;
}

it("compiles each component and hook in src", { timeout: 60_000 }, async () => {
  const files = globSync("src/**/*.{ts,tsx}").filter((file) => !file.includes(".test."));
  const skipped = (await Promise.all(files.map((file) => skippedFunctions(file)))).flat();
  expect(skipped).toEqual([]);
});
