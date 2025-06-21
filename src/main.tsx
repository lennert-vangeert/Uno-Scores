import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@mantine/core/styles.css";
import { MantineStyles } from "@global/style/mantineTheme/index.tsx";
import { router } from "./modules/routes";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { store } from "@global/store/store";
import { Notifications } from "@mantine/notifications";
import "@global/style/mantineTheme/fonts.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineStyles>
      <MantineProvider>
        <Provider store={store}>
          <Notifications />
          <RouterProvider router={router} />
        </Provider>
      </MantineProvider>
    </MantineStyles>
  </StrictMode>
);
