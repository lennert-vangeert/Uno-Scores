import { RouteObject } from "react-router-dom";
import PageWrapper from "../sections/pageWrapper";
import RequireAuth from "../auth/RequireAuth";
import LoginPage from "../auth/LoginPage";
import GamesListPage from "../app/gamesList";
import GamePage from "../app/game";
import StatsPage from "../app/stats";

export const publicRoutes: RouteObject[] = [
  // Public: the only route reachable while signed out.
  {
    path: "login",
    element: <LoginPage />,
  },
  // Everything else requires a signed-in user.
  {
    path: "",
    element: <RequireAuth />,
    children: [
      {
        path: "",
        element: <PageWrapper />,
        children: [
          { index: true, element: <GamesListPage /> },
          { path: "game/:gameId", element: <GamePage /> },
          { path: "stats", element: <StatsPage /> },
        ],
      },
    ],
  },
];
