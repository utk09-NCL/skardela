import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import {
  defaultSavedData,
  maxResults,
  mergeProgress,
  pickSavedData,
  savedDataKey,
  type PuzzleRef,
  type SavedData,
  type SolveResult,
} from "./saved-data";
import { isNewerText, parseStoredText, toStoredText } from "./storage-format";
import type { Theme } from "./theme";

// The store of the app. It holds the saved data and the actions that change it.
// Read a value with a selector, for example: const theme = useAppStore((state) => state.theme).
// A selector must give a value from the state, not a new array or object. Make lists from it in the component.
// The persist middleware saves the data in the browser after each change, and reads it when the app starts.

export type AppState = SavedData & {
  setTheme: (theme: Theme) => void;
  acknowledgeNotice: () => void;
  openPuzzle: (puzzle: PuzzleRef) => void;
  // This marks the rules of a puzzle type as seen. Then "More rules" is closed on the next visit.
  seeRules: (type: string) => void;
  recordSolve: (result: SolveResult) => void;
  // This adds the solves of an imported file. It gives the number of new solves.
  importData: (imported: SavedData) => number;
  // This removes all saved data. The state goes back to the default data.
  clearData: () => void;
};

// "unavailable": the browser blocks storage, for example in some private windows.
// "full": the storage of the site is full, thus the browser refuses new data.
// "outdated": a different tab saved data of a newer version of the app. This tab does not save until a reload.
export type StorageStatus = "ok" | "unavailable" | "full" | "outdated";

// The status of the storage. It is not saved. The storage notice in the layout shows it to the player.
export const useStorageStatus = create<{ status: StorageStatus }>()(() => ({ status: "ok" }));

// A browser reports a full storage with one of these error names.
function statusOf(error: unknown): StorageStatus {
  const isFull =
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
  return isFull ? "full" : "unavailable";
}

function setStatus(status: StorageStatus) {
  useStorageStatus.setState({ status });
}

// The storage never throws. When the browser blocks storage or the storage is full, the data stays in the store
// until the page closes, and the storage status tells the player. See "storage-format.ts" for the stored text.
// This version cannot read all of the data of a newer version. A write would lose that data, thus it stops.
const savedDataStorage: PersistStorage<SavedData> = {
  getItem: (name) => {
    try {
      const text = localStorage.getItem(name);
      if (isNewerText(text)) setStatus("outdated");
      return text === null ? null : { state: parseStoredText(text) };
    } catch (error) {
      setStatus(statusOf(error));
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (isNewerText(localStorage.getItem(name))) {
        setStatus("outdated");
        return;
      }
      localStorage.setItem(name, toStoredText(value.state));
      setStatus("ok");
    } catch (error) {
      setStatus(statusOf(error));
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
      setStatus("ok");
    } catch (error) {
      setStatus(statusOf(error));
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaultSavedData,
      setTheme: (theme) => {
        set({ theme });
      },
      acknowledgeNotice: () => {
        set({ cookieBanner: true });
      },
      openPuzzle: (puzzle) => {
        set({ lastOpened: puzzle });
      },
      // A type that is already in the list does not change the state, thus nothing renders again.
      seeRules: (type) => {
        set((state) =>
          state.seenRules.includes(type) ? state : { seenRules: [...state.seenRules, type] },
        );
      },
      recordSolve: (result) => {
        set((state) => ({
          solved: state.solved.includes(result.puzzleId)
            ? state.solved
            : [...state.solved, result.puzzleId],
          results: [...state.results, result].slice(-maxResults),
        }));
      },
      importData: (imported) => {
        const { data, added } = mergeProgress(pickSavedData(get()), imported);
        set(data);
        return added;
      },
      clearData: () => {
        set(defaultSavedData);
        void useAppStore.persist.clearStorage();
      },
    }),
    {
      name: savedDataKey,
      storage: savedDataStorage,
      // Only the data is saved, not the actions.
      partialize: (state: AppState) => pickSavedData(state),
    },
  ),
);

// A change in a different tab of the same site reads the saved data again. Thus all tabs show the same data.
// "key" is null when a tab clears all storage. "newValue" is null when a tab removes the saved data,
// for example with "Clear data". Then this tab also goes back to the default data.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== savedDataKey) return;
    if (event.newValue === null) useAppStore.setState(defaultSavedData);
    else void useAppStore.persist.rehydrate();
  });
}
