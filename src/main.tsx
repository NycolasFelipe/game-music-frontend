import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { useAuthStore } from "@/features/auth";
import { theme } from "@/lib/theme";
import { queryClient } from "@/services/queryClient";
import {
  setAuthTokenGetter,
  setUnauthorizedHandler,
} from "@/services/http";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

// Composition root: inject auth concerns into the (feature-agnostic) HTTP layer.
setAuthTokenGetter(() => useAuthStore.getState().token);
setUnauthorizedHandler(() => useAuthStore.getState().clear());

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications />
          <App />
        </MantineProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
