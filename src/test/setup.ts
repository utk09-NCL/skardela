import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { emptySession, usePlaySession } from "../shared/state/playSession";
import { useAppStore } from "../shared/state/store";

// jsdom has no "showModal" and no "close" for <dialog>. These small versions set "open",
// and "close" sends the "close" event as a browser does. They do not make the rest of the page inert.
function showModal(this: HTMLDialogElement) {
  this.open = true;
}

function close(this: HTMLDialogElement) {
  if (!this.open) return;
  this.open = false;
  this.dispatchEvent(new Event("close"));
}

// jsdom also has no "scrollIntoView". The home page uses it to go to a section, for example "/#stats".
function scrollIntoView() {
  // jsdom has no layout, thus there is nothing to scroll.
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = scrollIntoView;
}

if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = showModal;
  HTMLDialogElement.prototype.close = close;
}

afterEach(() => {
  cleanup();
  // Each test starts as a new player, so the saved data and the play session from an earlier test are removed.
  useAppStore.getState().clearData();
  usePlaySession.setState(emptySession);
  localStorage.clear();
});
