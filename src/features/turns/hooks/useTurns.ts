import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { advanceTurn, getTurns } from "@/features/turns/services/turns.api";

/** Query keys for the turns feature. */
export const turnKeys = {
  list: (bandId: string) => ["bands", bandId, "turns"] as const,
};

/** Server-state query for a band's turn timeline. */
export function useTurns(bandId: string) {
  return useQuery({
    queryKey: turnKeys.list(bandId),
    queryFn: () => getTurns(bandId),
    enabled: Boolean(bandId),
  });
}

/**
 * Advances the band's clock by one turn. Invalidates everything under the band
 * (year, members, turns and generated events all change).
 */
export function useAdvanceTurn(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => advanceTurn(bandId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bands", bandId] }),
  });
}
