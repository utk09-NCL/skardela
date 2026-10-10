import type { defaultNS } from "./config";
import type { TranslationResource } from "./locales/en";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: {
      translation: TranslationResource;
    };
  }
}
