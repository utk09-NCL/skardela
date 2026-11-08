import { type RouteObject } from "react-router";
import { Layout } from "./shell/Layout";
import { RouteError } from "./shell/RouteError";
import { HomePage } from "./pages/home/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { text } from "../text/en";
import { PuzzlePage } from "./pages/puzzle/PuzzlePage";
import { homeLoader, puzzleLoader } from "./puzzles";

// The route tree keeps the app shell and each page in one place.
// This makes it easy to follow the main flow for the home page and puzzle pages.
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        loader: homeLoader,
        element: <HomePage />,
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      {
        path: "puzzles/:puzzleId",
        loader: puzzleLoader,
        element: <PuzzlePage />,
        hydrateFallbackElement: <p>{text.puzzlePage.loading}</p>,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
