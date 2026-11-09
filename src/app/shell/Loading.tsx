import { useTranslation } from "react-i18next";

// The text while the data of a page loads. The routes show it before the loader of a page is done.
export function Loading() {
  const { t } = useTranslation();
  return <p>{t(($) => $.puzzlePage.loading)}</p>;
}
