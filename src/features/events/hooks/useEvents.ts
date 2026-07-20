import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listActiveEvents,
  listPassiveEvents,
  resolveActiveEvent,
} from "@/features/events/services/events.api";

/** Query keys for the events feature (nested under the band). */
export const eventKeys = {
  active: (bandId: string) => ["bands", bandId, "active-events"] as const,
  passive: (bandId: string) => ["bands", bandId, "passive-events"] as const,
};

/** A band's active (decision) events. */
export function useActiveEvents(bandId: string) {
  return useQuery({
    queryKey: eventKeys.active(bandId),
    queryFn: () => listActiveEvents(bandId),
    enabled: Boolean(bandId),
  });
}

/** A band's passive (timeline) events. */
export function usePassiveEvents(bandId: string) {
  return useQuery({
    queryKey: eventKeys.passive(bandId),
    queryFn: () => listPassiveEvents(bandId),
    enabled: Boolean(bandId),
  });
}

/**
 * Resolves an active event. Invalidates everything under the band (fans,
 * happiness, relationships and the event list all change).
 */
export function useResolveActiveEvent(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { eventId: string; optionId: string }) =>
      resolveActiveEvent(bandId, input.eventId, input.optionId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bands", bandId] }),
  });
}
