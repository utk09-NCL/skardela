import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "../text/en";
import { hi } from "../text/hi";

export const defaultNS = "translation";

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const supportedLanguages = Object.keys(resources) as SupportedLanguage[];

export function isSupportedLanguage(language: string | undefined): language is SupportedLanguage {
  return language !== undefined && Object.hasOwn(resources, language);
}

// The names in the language list, in their own language.
export const languageNames: Record<SupportedLanguage, string> = {
  en: "English",
  hi: "हिन्दी",
};

// The locale of the dates and the lists of each language. English uses British dates, for example "24 October".
const intlLocales: Record<SupportedLanguage, string> = {
  en: "en-GB",
  hi: "hi-IN",
};

function intlLocale(language: string | undefined): string {
  return isSupportedLanguage(language) ? intlLocales[language] : intlLocales.en;
}

export const i18n = createInstance();

export const LANGUAGE_STORAGE_KEY = "skardela.language";

// The page tells the browser and a screen reader its language.
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
    // The resources are in the bundle, thus the text is ready before the first render.
    initAsync: false,
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

// The formats in the text, for example "{{date, longDate}}".
// A date is a Date in the local time, or a day key, for example "2026-10-24". A day key is a date without a time,
// thus it is read and shown in UTC, and the date does not change with the time zone.
// See "src/shared/state/progress.ts".
function formatDate(
  value: Date | string,
  language: string | undefined,
  format: Intl.DateTimeFormatOptions,
) {
  const isDayKey = typeof value === "string";
  return new Intl.DateTimeFormat(intlLocale(language), {
    ...format,
    timeZone: isDayKey ? "UTC" : undefined,
  }).format(isDayKey ? new Date(`${value}T00:00:00Z`) : value);
}

i18n.services.formatter?.add("shortDate", (value: Date | string, language) =>
  formatDate(value, language, { day: "numeric", month: "long" }),
);

i18n.services.formatter?.add("longDate", (value: Date | string, language) =>
  formatDate(value, language, { weekday: "long", day: "numeric", month: "long" }),
);

// A list with "and", for example "a, b and c".
i18n.services.formatter?.add("andList", (value: readonly string[], language) =>
  new Intl.ListFormat(intlLocale(language), { type: "conjunction" }).format(value),
);
