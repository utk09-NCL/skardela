import { useRef, type ChangeEvent, type RefObject } from "react";
import shared from "../../../shared/Board.module.css";
import { useConfirm } from "../../../shared/useConfirm";
import { text } from "../../../text/en";
import { ClearQuestion } from "./ClearQuestion";
import styles from "./StatsPage.module.css";
import { useDataTransfer } from "./useDataTransfer";

const words = text.stats;
const buttonClass = `${shared.button} ${shared.boxed}`;

type DataButtonsProps = {
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  clearRef: RefObject<HTMLButtonElement | null>;
  onClear: () => void;
};

// The three buttons: export, import and clear. "Import" opens the file list of a hidden file input.
// "Clear my data" has the danger colour, because the delete cannot be undone.
function DataButtons({ onExport, onImport, clearRef, onClear }: DataButtonsProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className={buttonClass} onClick={onExport}>
        {words.data.export}
      </button>
      <button type="button" className={buttonClass} onClick={() => fileInput.current?.click()}>
        {words.data.import}
      </button>
      <input
        ref={fileInput}
        type="file"
        name="import"
        accept="application/json,.json"
        hidden
        onChange={onImport}
      />
      <button
        ref={clearRef}
        type="button"
        className={`${buttonClass} ${shared.danger}`}
        onClick={onClear}
      >
        {words.clear.button}
      </button>
    </>
  );
}

// "Your data": the title and the note, the buttons, and the message line. The message line is a live region,
// so a screen reader reads the result of each action. See "useDataTransfer.ts".
// "Clear my data" asks one time. The question takes the place of the three buttons, so the panel keeps its size.
export function DataActions() {
  const { message, exportData, importFile } = useDataTransfer();
  const { isOpen, buttonRef, noRef, open, close } = useConfirm();
  return (
    <section className={`${styles.panel} ${styles.data}`} aria-labelledby="data-heading">
      <div className={styles.dataText}>
        <h2 id="data-heading" className={styles.panelTitle}>
          {words.data.heading}
        </h2>
        <p className={styles.dataNote}>
          {words.data.note} {words.clear.note}
        </p>
      </div>
      <div className={styles.dataButtons}>
        {isOpen ? (
          <ClearQuestion noRef={noRef} onNo={close} />
        ) : (
          <DataButtons
            onExport={exportData}
            onImport={(event) => {
              void importFile(event);
            }}
            clearRef={buttonRef}
            onClear={open}
          />
        )}
      </div>
      <output className={styles.dataMessage} data-error={message?.isError ?? false}>
        {message?.text}
      </output>
    </section>
  );
}
