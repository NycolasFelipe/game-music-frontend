import type { LoginInput, LoginResponse } from "@/features/auth/types";
import { http } from "@/services/http";

/** Authenticates with the backend and returns the access token. */
export function login(input: LoginInput): Promise<LoginResponse> {
  return http.post<LoginResponse>("/auth/login", input);
}
