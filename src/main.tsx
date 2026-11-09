import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
// The fonts are in the app, thus the page sends no request to a font service before the analytics notice.
// Funnel Display and Ubuntu Sans Mono are variable fonts. Each one has all its weights in one file.
import "@fontsource-variable/funnel-display/index.css";
import "@fontsource-variable/ubuntu-sans-mono/index.css";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import { i18n } from "./i18n/config.ts";
import { router } from "./app/router.ts";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error('The page has no element with the ID "root".');
}

createRoot(rootElement).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </StrictMode>,
);
