import type { defaultNS } from "./config";
import type { en } from "../text/en";

// The types of the keys of "t". TypeScript shows an error for a key that is not in the English text.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    enableSelector: true;
    resources: {
      translation: typeof en;
    };
  }
}
