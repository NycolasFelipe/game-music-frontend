import { useAuthStore } from "@/features/auth/store/auth.store";

/** Reads the current auth status and exposes logout. */
export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.clear);
  return { isAuthenticated: Boolean(token), token, logout };
}
