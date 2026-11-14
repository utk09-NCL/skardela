import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
// The fonts are in the app, thus the page sends no request to a font service before the analytics notice.
// Funnel Display and Ubuntu Sans Mono are variable fonts. Each one has all its weights in one file.
import "@fontsource-variable/funnel-display/index.css";
import "@fontsource-variable/ubuntu-sans-mono/index.css";
import "./index.css";
import { router } from "./app/router.ts";
import { reloadAfterRelease } from "./app/shell/reloadAfterRelease.ts";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error('The page has no element with the ID "root".');
}

// An open tab that asks for a file of an old release loads the page again. See "reloadAfterRelease.ts".
reloadAfterRelease();

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
