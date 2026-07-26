import type { UserPreferences } from "@/features/preferences/types";
import { http } from "@/services/http";

/** Reads the signed-in user's account preferences. */
export function getUserPreferences(): Promise<UserPreferences> {
  return http.get<UserPreferences>("/users/me/preferences");
}

/** Updates part of the signed-in user's account preferences. */
export function updateUserPreferences(
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  return http.patch<UserPreferences>("/users/me/preferences", patch);
}
