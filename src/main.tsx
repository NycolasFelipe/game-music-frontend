import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { cssVariablesResolver, theme } from "@/lib/theme";
import { router } from "@/routes/router";
import { queryClient } from "@/services/queryClient";
import { setAuthTokenGetter, setUnauthorizedHandler } from "@/services/http";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@/styles/revista.css";

// Composition root: inject auth concerns into the (feature-agnostic) HTTP layer.
setAuthTokenGetter(() => useAuthStore.getState().token);
setUnauthorizedHandler(() => useAuthStore.getState().clear());

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={theme}
        cssVariablesResolver={cssVariablesResolver}
        forceColorScheme="light"
      >
        <Notifications />
        <RouterProvider router={router} />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
