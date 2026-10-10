import { type RouteObject } from "react-router";
import { T } from "../components/T";
import { Layout } from "./Layout";
import { RouteError } from "./RouteError";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <T k="home.greeting" />,
      },
      {
        path: "1",
        element: <T k="pages.one" />,
      },
    ],
  },
  {
    path: "/2",
    element: <T k="pages.two" />,
    errorElement: <T k="errors.pageTwoError" />,
  },
  {
    path: "*",
    element: <T k="errors.notFound" />,
  },
];
