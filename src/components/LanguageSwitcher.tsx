import { useTranslation } from "react-i18next";
import { languageNames, supportedLanguages, type SupportedLanguage } from "../i18n/config";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "en") as SupportedLanguage;

  return (
    <label>
      {t("common.language")}{" "}
      <select value={current} onChange={(event) => void i18n.changeLanguage(event.target.value)}>
        {supportedLanguages.map((language) => (
          <option key={language} value={language} lang={language}>
            {languageNames[language]}
          </option>
        ))}
      </select>
    </label>
  );
}
