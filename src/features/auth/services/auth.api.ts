import type { LoginInput, LoginResponse, User } from "@/features/auth/types";
import { http } from "@/services/http";

/** Authenticates with the backend and returns the token + public user. */
export function login(input: LoginInput): Promise<LoginResponse> {
  return http.post<LoginResponse>("/auth/login", input);
}

/** Returns the currently authenticated user (from the Bearer token). */
export function getCurrentUser(): Promise<User> {
  return http.get<User>("/auth/me");
}
