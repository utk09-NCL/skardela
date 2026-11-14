import { app } from "./app";

// Spanish translations for the application. The app does not use this text yet.
// It has the same folder structure as "src/text/en/": "index.ts" puts the parts together.
// It has only a part of the text of the app frame. "app.ts" checks that each field has the same type as in "en".
// Before the app can use it, it needs all fields of "en", also the text of the pages and the puzzle types.
export const text = {
  ...app,
};
