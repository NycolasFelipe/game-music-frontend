import { Navigate, Route, Routes } from "react-router-dom";
import { BandDashboardPage } from "@/pages/BandDashboardPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NewSavePage } from "@/pages/NewSavePage";
import { RequireAuth } from "@/routes/RequireAuth";

/** Application route table. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/saves/new" element={<NewSavePage />} />
        <Route path="/bands/:bandId" element={<BandDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
