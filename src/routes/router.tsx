import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { BandDashboardPage } from "@/pages/BandDashboardPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NewSavePage } from "@/pages/NewSavePage";
import { RequireAuth } from "@/routes/RequireAuth";

/**
 * Data router (enables `useBlocker` for the unsaved-changes guard). Auth-guarded
 * pages render inside the shared {@link AppLayout}.
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/saves/new", element: <NewSavePage /> },
          { path: "/bands/:bandId", element: <BandDashboardPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
