import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/services/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

/** Login mutation: on success, stores the token in the auth store. */
export function useLogin() {
  const setToken = useAuthStore((state) => state.setToken);
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => setToken(data.accessToken),
  });
}
