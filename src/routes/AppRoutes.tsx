import { Navigate, Route, Routes } from "react-router-dom";
import { BandsPage } from "@/pages/BandsPage";
import { LoginPage } from "@/pages/LoginPage";
import { RequireAuth } from "@/routes/RequireAuth";

/** Application route table. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/bands" element={<BandsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/bands" replace />} />
    </Routes>
  );
}
