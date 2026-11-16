import { describe, expect, it } from "vitest";
import { cipherText, decipherText } from "./cipher";

describe("word bank cipher", () => {
  const bank = "CAT A small pet that says meow\nBAG You carry things in it\n";

  it("gives back the text that it ciphers", () => {
    expect(decipherText(cipherText(bank))).toBe(bank);
  });

  it("hides the words and the clues", () => {
    const code = cipherText(bank);
    expect(code).toMatch(/^[A-Za-z0-9+/]+=*$/u);
    expect(atob(code)).not.toContain("CAT");
    expect(atob(code)).not.toContain("meow");
  });

  // The bank of Guzzle is long. The cipher must not put all its bytes into one function call.
  it("ciphers a long text", () => {
    const long = bank.repeat(20_000);
    expect(decipherText(cipherText(long))).toBe(long);
  });
});
