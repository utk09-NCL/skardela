import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { hi } from "./locales/hi";

export const defaultNS = "translation";

export const resources = {
  en: { translation: en },
  es: { translation: es },
  hi: { translation: hi },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const supportedLanguages = Object.keys(resources) as SupportedLanguage[];

/** Names shown in the language switcher, written in their own language. */
export const languageNames: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  hi: "हिन्दी",
};

export const i18n = createInstance();

export const LANGUAGE_STORAGE_KEY = "skardela.language";

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
}

i18n.on("languageChanged", syncDocumentLanguage);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    // Map regional variants such as "en-US" or "hi-IN" to the base language.
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    detection: {
      // An explicit choice (?lng= or a saved preference) wins over the browser setting.
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      lookupQuerystring: "lng",
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      // React already escapes rendered values.
      escapeValue: false,
    },
    returnNull: false,
  });
