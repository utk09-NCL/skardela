import type { TFunction } from "i18next";
import { useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { getLogger } from "../../../shared/logger";
import { dayKey } from "../../../shared/state/progress";
import { pickSavedData } from "../../../shared/state/saved-data";
import { saveFile } from "../../../shared/save-file";
import { parseImportText, toExportText } from "../../../shared/state/storage-format";
import { useAppStore } from "../../../shared/state/store";

// An export file of 2000 solves is about 30 KB. A much larger file is not a Skardela data file.
const maxImportBytes = 5 * 1024 * 1024;
const log = getLogger("ui.data-transfer");

export type Message = { readonly text: string; readonly isError: boolean } | null;

// The text of an import file, or the error text for the player.
async function readImport(t: TFunction, file: File): Promise<{ text: string } | { error: string }> {
  if (file.size > maxImportBytes) return { error: t(($) => $.home.stats.data.tooLarge) };
  try {
    return { text: await file.text() };
  } catch {
    return { error: t(($) => $.home.stats.data.notData) };
  }
}

// The export and the import of the saved data, and the message that tells the result.
// The store keeps the data also when the browser cannot save it, thus an export always has the data of this page.
export function useDataTransfer() {
  const { t } = useTranslation();
  const importData = useAppStore((state) => state.importData);
  const [message, setMessage] = useState<Message>(null);

  const exportData = () => {
    const now = new Date();
    const fileName = t(($) => $.home.stats.data.fileName, { day: dayKey(now) });
    saveFile(fileName, toExportText(pickSavedData(useAppStore.getState()), now));
    log.info("Data exported");
    setMessage({ text: t(($) => $.home.stats.data.exported, { fileName }), isError: false });
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // The same file can be selected again after this.
    input.value = "";
    if (file === undefined) return;
    const read = await readImport(t, file);
    if ("error" in read) {
      setMessage({ text: read.error, isError: true });
      return;
    }
    const data = parseImportText(read.text);
    if (data === null) {
      setMessage({ text: t(($) => $.home.stats.data.notData), isError: true });
      return;
    }
    const added = importData(data);
    log.info("Data imported", { added });
    setMessage({ text: t(($) => $.home.stats.data.imported, { count: added }), isError: false });
  };

  return { message, exportData, importFile };
}
