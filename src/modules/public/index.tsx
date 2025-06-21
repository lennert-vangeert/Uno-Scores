import { RouteObject } from "react-router-dom";
import Homepage from "./homepage";
import PageWrapper from "../sections/pageWrapper";

export const publicRoutes: RouteObject[] = [
  {
    path: "",
    element: <PageWrapper />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
    ],
  },
];
