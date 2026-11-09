import { Link } from "react-router";
import { useTranslation } from "react-i18next";

// This page tells the user that the path does not exist.
// It gives a direct route back to the start page.
export function NotFoundPage() {
  const { t } = useTranslation();
  const title = t(($) => $.notFound.title);
  return (
    <>
      <title>{t(($) => $.pageTitle, { title, siteName: t(($) => $.siteName) })}</title>
      <h1 data-testid="not-found-page-title">{title}</h1>
      <p>{t(($) => $.notFound.body)}</p>
      <p>
        <Link to="/">{t(($) => $.notFound.homeLink)}</Link>
      </p>
    </>
  );
}
