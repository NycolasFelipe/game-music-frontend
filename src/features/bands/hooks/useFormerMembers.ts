import { useQuery } from "@tanstack/react-query";
import { getFormerMembers } from "@/features/bands/services/bands.api";

/** Query key for a band's former members. */
export const formerMemberKeys = {
  list: (bandId: string) => ["bands", bandId, "former-members"] as const,
};

/** Server-state query for a band's former (departed) members. */
export function useFormerMembers(bandId: string) {
  return useQuery({
    queryKey: formerMemberKeys.list(bandId),
    queryFn: () => getFormerMembers(bandId),
    enabled: Boolean(bandId),
  });
}
