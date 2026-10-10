import { useTranslation } from "react-i18next";
import type { TranslationResource } from "../i18n/locales/en";

type Section = keyof TranslationResource;
type SectionKey<S extends Section> = `${S}.${Extract<keyof TranslationResource[S], string>}`;
export type TranslationKey = { [S in Section]: SectionKey<S> }[Section];

/** Renders a translated string in a block element. */
export function T({ k }: { k: TranslationKey }) {
  const { t } = useTranslation();
  return <div>{t(k)}</div>;
}
