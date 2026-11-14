// The skills are in two folders: ".claude/skills" for Claude Code and ".agents/skills" for the other AI tools
// (see agentskills.io). The two folders must have the same files with the same text, so each tool does the same steps.
// This check fails when a change goes to only one folder.
import { globSync, readFileSync, statSync } from "node:fs";
import { expect, it } from "vitest";

const folders = [".claude/skills", ".agents/skills"] as const;

function filesIn(root: string): string[] {
  return globSync("**/*", { cwd: root })
    .filter((file) => statSync(`${root}/${file}`).isFile())
    .toSorted();
}

it("has the same skills in .claude/skills and .agents/skills", () => {
  const [claude, agents] = folders;
  const files = filesIn(claude);
  expect(files.length).toBeGreaterThan(0);
  expect(filesIn(agents)).toEqual(files);
  // The file name is in the result, so a failure tells which file is different.
  const different = files.filter(
    (file) =>
      readFileSync(`${agents}/${file}`, "utf8") !== readFileSync(`${claude}/${file}`, "utf8"),
  );
  expect(different).toEqual([]);
});
