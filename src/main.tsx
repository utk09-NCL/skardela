import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
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
