import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/features/auth/services/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

/** Query keys for the auth feature. */
export const authKeys = {
  me: ["auth", "me"] as const,
};

/** Server-state query for the current user; enabled only when authenticated. */
export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getCurrentUser,
    enabled: Boolean(token),
  });
}
