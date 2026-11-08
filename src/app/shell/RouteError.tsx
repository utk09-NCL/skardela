import { useEffect } from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { text } from "../../text/en";
import styles from "./RouteError.module.css";
import { getLogger } from "../../shared/logger";

// This view shows a simple page when a route fails.
// It keeps the user in the app and gives the team useful error data in the log.
export function RouteError() {
  const error = useRouteError();
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
      <title>{`${text.routeError.title} | ${text.siteName}`}</title>
      <h1 data-testid="route-error-title">{text.routeError.title}</h1>
      <p>{text.routeError.body}</p>
      <p>
        <Link to="/">{text.routeError.homeLink}</Link>
      </p>
    </main>
  );
}
