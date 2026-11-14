import type { app as english } from "../en/app";

// A part of the English text: each field is optional, but a field that is here has the same type as in English.
// Thus a Spanish field cannot have a different name or a different form, for example a text in place of a function.
type PartOf<Text> = {
  readonly [Name in keyof Text]?: Text[Name] extends (...args: never[]) => unknown
    ? Text[Name]
    : Text[Name] extends object
      ? PartOf<Text[Name]>
      : Text[Name];
};

// The text of the app frame in Spanish. See "src/text/en/app.ts" for the English text.
export const app = {
  siteName: "Skardela",
  skipLink: "Saltar al contenido principal",
  nav: {
    label: "Principal",
    stats: "Tus estadísticas",
  },
  footer: {
    content: (year: number) => `© ${year} Skardela. Este sitio web usa analíticas sin cookies.`,
  },
} satisfies PartOf<typeof english>;
