import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Client-side auth state: the bearer token, persisted across reloads. */
interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clear: () => set({ token: null }),
    }),
    { name: "gm-auth" },
  ),
);
