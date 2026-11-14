import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { getLogger } from "../../shared/logger";
import { reloadPage } from "../../shared/reload";
import { reloadAfterRelease } from "./reloadAfterRelease";

// jsdom cannot load a page again, thus the test replaces "reloadPage".
vi.mock(import("../../shared/reload"), () => ({ reloadPage: vi.fn<() => void>() }));

// Vite sends this event when the import of a file of the app fails.
function failImport(): Event {
  const event = new Event("vite:preloadError", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

// Each reload logs a warning. The test replaces the warning, so the test output stays clean, and the test can check that the page logs it.
let warn: MockInstance;

beforeEach(() => {
  warn = vi.spyOn(getLogger("app.release"), "warn").mockImplementation(() => {});
});

afterEach(() => {
  sessionStorage.clear();
});

describe("reloadAfterRelease", () => {
  it("loads the page again when the import of a file fails, and stops the error", () => {
    const stop = reloadAfterRelease();
    const event = failImport();
    stop();
    expect(reloadPage).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
    expect(warn).toHaveBeenCalledExactlyOnceWith(
      "A file of the app did not load. The page loads again.",
    );
  });

  it("does not load the page again for a second failed import soon after a reload", () => {
    const stop = reloadAfterRelease();
    failImport();
    const second = failImport();
    stop();
    expect(reloadPage).toHaveBeenCalledOnce();
    expect(second.defaultPrevented).toBe(false);
  });

  it("loads the page again for a failed import more than 10 s after the last reload", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(50_000);
    const stop = reloadAfterRelease();
    failImport();
    now.mockReturnValue(60_001);
    const later = failImport();
    stop();
    expect(reloadPage).toHaveBeenCalledTimes(2);
    expect(later.defaultPrevented).toBe(true);
  });

  // Without storage, the page cannot know if it reloaded already. A reload could then occur without end.
  it("does not load the page again when the browser blocks the storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("The storage is blocked.", "SecurityError");
    });
    const stop = reloadAfterRelease();
    const event = failImport();
    stop();
    expect(reloadPage).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
