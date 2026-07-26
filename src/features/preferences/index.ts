/** Public API of the preferences feature. */
export {
  preferenceKeys,
  usePeopleView,
  useUpdateUserPreferences,
  useUserPreferences,
} from "@/features/preferences/hooks/usePreferences";
export type {
  PeopleViewMode,
  UserPreferences,
} from "@/features/preferences/types";
