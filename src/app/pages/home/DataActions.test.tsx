import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { defaultSavedData, type SolveResult } from "../../../shared/state/saved-data";
import { saveFile } from "../../../shared/save-file";
import { parseImportText, toExportText } from "../../../shared/state/storage-format";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { DataActions } from "./DataActions";

// jsdom cannot download a file or load a page again, thus the tests replace these two functions.
vi.mock(import("../../../shared/save-file"), () => ({
  saveFile: vi.fn<(fileName: string, content: string) => void>(),
}));
vi.mock(import("../../../shared/reload"), () => ({ reloadPage: vi.fn<() => void>() }));

const words = text.home.stats.data;
const solve: SolveResult = {
  puzzleId: "latics-0004",
  type: "latics",
  difficulty: "medium",
  seconds: 95,
  day: "2026-10-20",
};

// The file input is hidden. The "Import" button opens it, thus the test gives the file to the input.
function importInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (input === null) throw new Error("The import has no file input.");
  return input;
}

// The file name and the text of the last saved file.
function lastSavedFile(): [string, string] {
  const call = vi.mocked(saveFile).mock.calls.at(-1);
  if (call === undefined) throw new Error("No file was saved.");
  return [call[0], call[1]];
}

function message() {
  return screen.getByRole("status");
}

describe("export", () => {
  it("saves a file with the data of this page, and tells the file name", async () => {
    useAppStore.getState().recordSolve(solve);
    const user = userEvent.setup();
    render(<DataActions />);
    await user.click(screen.getByRole("button", { name: words.export }));

    const [fileName, content] = lastSavedFile();
    expect(fileName).toMatch(/^skardela-data-\d{4}-\d{2}-\d{2}\.json$/u);
    expect(parseImportText(content)?.results).toEqual([solve]);
    expect(message()).toHaveTextContent(words.exported(fileName));
  });
});

describe("import", () => {
  it("adds the solves of an export file and tells how many are new", async () => {
    const user = userEvent.setup();
    render(<DataActions />);
    const exported = toExportText(
      { ...defaultSavedData, solved: [solve.puzzleId], results: [solve] },
      new Date(),
    );
    await user.upload(
      importInput(),
      new File([exported], "backup.json", { type: "application/json" }),
    );

    expect(await screen.findByText(words.imported(1))).toBeInTheDocument();
    expect(useAppStore.getState().results).toEqual([solve]);
    expect(useAppStore.getState().solved).toEqual([solve.puzzleId]);
  });

  it("tells that a file is not a Skardela data file, and changes nothing", async () => {
    const user = userEvent.setup();
    render(<DataActions />);
    await user.upload(
      importInput(),
      new File(['{"name":"other"}'], "other.json", { type: "application/json" }),
    );

    expect(await screen.findByText(words.notData)).toBeInTheDocument();
    expect(message()).toHaveAttribute("data-error", "true");
    expect(useAppStore.getState().results).toEqual([]);
  });

  it("refuses a file that is too large", async () => {
    const user = userEvent.setup();
    render(<DataActions />);
    const large = new File(["{}"], "large.json", { type: "application/json" });
    Object.defineProperty(large, "size", { value: 6 * 1024 * 1024 });
    await user.upload(importInput(), large);
    expect(await screen.findByText(words.tooLarge)).toBeInTheDocument();
  });
});
