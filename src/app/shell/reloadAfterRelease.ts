import { getLogger } from "../../shared/logger";
import { reloadPage } from "../../shared/reload";

// After a new release, a tab that is still open has the old version of the app. When the player opens a board
// that the tab did not load yet, the tab asks for the file of the old version. That file is gone, thus the import
// fails, and Vite sends "vite:preloadError". A reload gets the new version, and the board loads.
// The time of the reload is in sessionStorage. A second failed import soon after a reload does not reload again,
// so a broken release cannot reload the page without end. Then the page shows its error message.
const reloadKey = "skardela.reloadAfterRelease";
const minTimeBetweenReloads = 10_000;

function onImportError(event: Event) {
  const now = Date.now();
  try {
    if (now - Number(sessionStorage.getItem(reloadKey)) < minTimeBetweenReloads) return;
    sessionStorage.setItem(reloadKey, String(now));
  } catch {
    // Without storage, the page cannot know if it reloaded already. Thus it does not reload.
    return;
  }
  getLogger("app.release").warn("A file of the app did not load. The page loads again.");
  // Vite throws the error only when no listener stops the event.
  event.preventDefault();
  reloadPage();
}

// This starts to listen. It gives a function that stops the listener, for the tests.
export function reloadAfterRelease(): () => void {
  window.addEventListener("vite:preloadError", onImportError);
  return () => {
    window.removeEventListener("vite:preloadError", onImportError);
  };
}
