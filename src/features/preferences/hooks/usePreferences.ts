import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/features/preferences/services/preferences.api";
import type {
  PeopleViewMode,
  UserPreferences,
} from "@/features/preferences/types";

/** Query key for the signed-in user's preferences. */
export const preferenceKeys = {
  mine: ["user-preferences"] as const,
};

/** What the UI shows before the server answers. */
const DEFAULTS: UserPreferences = { peopleView: "cards" };

/** The signed-in user's account preferences (ADR-0018). */
export function useUserPreferences() {
  return useQuery({
    queryKey: preferenceKeys.mine,
    queryFn: getUserPreferences,
    staleTime: Infinity,
  });
}

/**
 * Updates part of the preferences. Applied optimistically: a view toggle that
 * waited for a round trip would feel broken, and the worst case of being wrong
 * is a control that snaps back.
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserPreferences>) => updateUserPreferences(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: preferenceKeys.mine });
      const previous = queryClient.getQueryData<UserPreferences>(
        preferenceKeys.mine,
      );
      queryClient.setQueryData<UserPreferences>(preferenceKeys.mine, {
        ...DEFAULTS,
        ...previous,
        ...patch,
      });
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(preferenceKeys.mine, context.previous);
      }
    },
    onSuccess: (preferences) =>
      queryClient.setQueryData(preferenceKeys.mine, preferences),
  });
}

/**
 * The shared cards/graph choice, with its setter — the same taste drives the
 * relationships section and the guest picker (ADR-0018 §4).
 *
 * @returns The current mode and a setter that persists it for the account.
 */
export function usePeopleView(): [PeopleViewMode, (mode: PeopleViewMode) => void] {
  const { data } = useUserPreferences();
  const update = useUpdateUserPreferences();

  return [
    data?.peopleView ?? DEFAULTS.peopleView,
    (peopleView) => update.mutate({ peopleView }),
  ];
}
