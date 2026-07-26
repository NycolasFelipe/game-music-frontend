import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getActivityOptions,
  holdActivity,
  listBandActivities,
} from "@/features/activities/services/activities.api";

/** Query keys for the activities feature (nested under the band). */
export const activityKeys = {
  options: (bandId: string) => ["bands", bandId, "activity-options"] as const,
  list: (bandId: string) => ["bands", bandId, "activities"] as const,
};

/** The activities on offer, priced for this band. */
export function useActivityOptions(bandId: string) {
  return useQuery({
    queryKey: activityKeys.options(bandId),
    queryFn: () => getActivityOptions(bandId),
    enabled: Boolean(bandId),
  });
}

/** The activities the band has held. */
export function useBandActivities(bandId: string) {
  return useQuery({
    queryKey: activityKeys.list(bandId),
    queryFn: () => listBandActivities(bandId),
    enabled: Boolean(bandId),
  });
}

/**
 * Holds an activity. Invalidates everything under the band — cash, happiness,
 * relationships and (when the night goes wrong) the pending decisions all move.
 */
export function useHoldActivity(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { activityId: string; participantIds: string[] }) =>
      holdActivity(bandId, input.activityId, input.participantIds),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bands", bandId] }),
  });
}
