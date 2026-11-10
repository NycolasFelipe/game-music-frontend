import { Link, Outlet } from "react-router-dom";
import { HalftoneDefs } from "@/components/halftone";
import { APP_NAME } from "@/config/app";
import { useAuth } from "@/features/auth";

/**
 * Shared shell for authenticated pages (ADR-0002): the subscriber bar on the
 * desk, and the page itself printed on a sheet of paper.
 */
export function AppLayout() {
  const { logout } = useAuth();

  return (
    <>
      <HalftoneDefs />
      <div className="rv-deskbar">
        <span>{APP_NAME} · edição do assinante</span>
        <Link to="/">Banca</Link>
        <button type="button" onClick={logout}>
          Sair
        </button>
      </div>
      <main className="rv-sheet">
        <Outlet />
      </main>
    </>
  );
}
