import { useTranslation } from "react-i18next";
import { isSupportedLanguage, languageNames, supportedLanguages } from "../i18n/config";

// This list lets the player select the language of the site. i18next saves the choice in the browser.
// A native <select> works with a keyboard and a screen reader without more code.
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = isSupportedLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : "en";

  return (
    <label>
      <span className="visually-hidden">{t(($) => $.language.label)}</span>
      <select
        name="language"
        value={current}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language} lang={language}>
            {languageNames[language]}
          </option>
        ))}
      </select>
    </label>
  );
}
