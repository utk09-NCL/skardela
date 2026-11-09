import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import styles from "./RouteError.module.css";
import { getLogger } from "../../shared/logger";

// This view shows a simple page when a route fails.
// It keeps the user in the app and gives the team useful error data in the log.
export function RouteError() {
  const error = useRouteError();
  const { t } = useTranslation();
  const title = t(($) => $.routeError.title);
  useEffect(() => {
    const log = getLogger("app.route-error");
    if (isRouteErrorResponse(error)) {
      // The second argument of "error" is the error. A response is not an error, thus it is undefined,
      // and the status goes in the details.
      log.error("Route error response", undefined, {
        status: error.status,
        statusText: error.statusText,
      });
    } else {
      log.error("Route error thrown", error);
    }
  }, [error]);

  return (
    <main className={`content-width ${styles.main}`}>
      <title>{t(($) => $.pageTitle, { title, siteName: t(($) => $.siteName) })}</title>
      <h1 data-testid="route-error-title">{title}</h1>
      <p>{t(($) => $.routeError.body)}</p>
      <p>
        <Link to="/">{t(($) => $.routeError.homeLink)}</Link>
      </p>
    </main>
  );
}
