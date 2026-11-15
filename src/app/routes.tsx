import { type RouteObject } from "react-router";
import { Layout } from "./shell/Layout";
import { RouteError } from "./shell/RouteError";
import { HomePage } from "./pages/home/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { text } from "../text/en";
import { PuzzlePage } from "./pages/puzzle/PuzzlePage";
import { StatsPage } from "./pages/stats/StatsPage";
import { homeLoader, puzzleLoader } from "./puzzles";

// The route tree keeps the app shell and each page in one place.
// This makes it easy to follow the main flow for the home page, the stats page and the puzzle pages.
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
      // The stats page uses the home loader for the list of puzzle types and the first puzzle of today.
      {
        path: "stats",
        loader: homeLoader,
        element: <StatsPage />,
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
