import { useRef } from "react";
import { useTranslation } from "react-i18next";
import shared from "../../../shared/Board.module.css";
import { ClearData } from "./ClearData";
import styles from "./HomePage.module.css";
import { useDataTransfer } from "./useDataTransfer";

const buttonClass = `${shared.button} ${shared.boxed}`;

// Export, import and clear the saved data, in one row. The message line is a live region,
// so a screen reader reads the result of each action. See "useDataTransfer.ts".
export function DataActions() {
  const { t } = useTranslation();
  const { message, exportData, importFile } = useDataTransfer();
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <div className={styles.data}>
      <div className={styles.dataButtons}>
        <button type="button" className={buttonClass} onClick={exportData}>
          {t(($) => $.home.stats.data.export)}
        </button>
        {/* The button opens the file list of the hidden file input. */}
        <button type="button" className={buttonClass} onClick={() => fileInput.current?.click()}>
          {t(($) => $.home.stats.data.import)}
        </button>
        <input
          ref={fileInput}
          type="file"
          name="import"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            void importFile(event);
          }}
        />
        <ClearData />
      </div>
      <output className={styles.dataMessage} data-error={message?.isError ?? false}>
        {message?.text}
      </output>
      <p className={styles.dataNote}>
        {t(($) => $.home.stats.data.note)} {t(($) => $.home.stats.clear.note)}
      </p>
    </div>
  );
}
