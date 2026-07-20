import { useQuery } from "@tanstack/react-query";
import { getTurns } from "@/features/turns/services/turns.api";

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
