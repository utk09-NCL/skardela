// The word bank of Guzzle must go to the browser only as ciphered text. See "cipherWordBank" in "vite.config.ts".
// The build makes the worker with its own list of plugins, and it reads a ".txt" file as text.
// Thus a change to the config or a new version of Vite can break the bank only in the built site:
// the unit tests and the dev server still work. This check builds the site and reads the built files.
import { readFileSync } from "node:fs";
import { build } from "vite";
import { expect, it } from "vitest";
import { decipherText } from "../src/shared/cipher";

const bank = readFileSync("src/app/puzzle-types/guzzle/words.txt", "utf8");

// The text of each built file. The build does not write the files.
async function builtFiles(): Promise<{ name: string; text: string }[]> {
  const result = await build({ logLevel: "silent", build: { write: false } });
  return [result].flat().flatMap((item) =>
    "output" in item
      ? item.output.map((file) => ({
          name: file.fileName,
          text: file.type === "chunk" ? file.code : Buffer.from(file.source).toString("utf8"),
        }))
      : [],
  );
}

// Each ciphered bank in a file: a long run of Base64 characters, with the code before it.
function cipheredBanks(text: string): { before: string; code: string }[] {
  return [...text.matchAll(/(.{16})([A-Za-z0-9+/=]{10000,})/gu)].map(
    ([, before = "", code = ""]) => ({ before, code }),
  );
}

it(
  "puts the word bank in the built files only as ciphered text",
  { timeout: 120_000 },
  async () => {
    const files = await builtFiles();
    // The first line of the bank is readable in no file.
    const [firstLine = ""] = bank.split("\n");
    expect(files.filter(({ text }) => text.includes(firstLine)).map(({ name }) => name)).toEqual(
      [],
    );
    // The page and the worker each have the ciphered bank, and it gives the bank back.
    const banks = files.flatMap(({ text }) => cipheredBanks(text));
    expect(banks.length).toBeGreaterThanOrEqual(2);
    expect(banks.filter(({ code }) => decipherText(code) !== bank)).toEqual([]);
    // When the build reads the result of the plugin as text, the worker gets the code of the plugin
    // ('export default "..."') as its bank, and cannot decode it.
    expect(banks.filter(({ before }) => before.includes("export default"))).toEqual([]);
  },
);
