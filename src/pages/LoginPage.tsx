import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/features/auth";
import { APP_NAME } from "@/config/app";

/** Login route, as the subscribers' edition cover. On success, goes to the newsstand. */
export function LoginPage() {
  const navigate = useNavigate();
  const [first, ...rest] = APP_NAME.split(" ");

  return (
    <main className="rv-sheet" style={{ maxWidth: 520, marginTop: 60 }}>
      <div className="rv-topline">
        <span>Edição para assinantes</span>
      </div>
      <div className="rv-mast rv-small">
        {first} <em>{rest.join(" ")}</em>
      </div>
      <p className="rv-deck">Monte uma banda, grave discos, aguente o elenco.</p>
      <LoginForm onSuccess={() => navigate("/")} />
    </main>
  );
}
