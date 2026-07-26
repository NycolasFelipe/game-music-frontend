import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGigTypes, listGigs, playGig } from "@/features/gigs/services/gigs.api";

/** Query keys for the gigs feature. */
export const gigKeys = {
  types: ["gigs", "types"] as const,
  list: (bandId: string) => ["bands", bandId, "gigs"] as const,
};

/** The live-circuit catalog from the backend. */
export function useGigTypes() {
  return useQuery({
    queryKey: gigKeys.types,
    queryFn: getGigTypes,
    staleTime: Infinity,
  });
}

/** The band's played seasons. */
export function useGigs(bandId: string) {
  return useQuery({
    queryKey: gigKeys.list(bandId),
    queryFn: () => listGigs(bandId),
    enabled: Boolean(bandId),
  });
}

/**
 * Plays a live season. Invalidates everything under the band — cash, fans,
 * happiness and stage skills all move.
 */
export function usePlayGig(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gigTypeId: string) => playGig(bandId, gigTypeId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bands", bandId] }),
  });
}
