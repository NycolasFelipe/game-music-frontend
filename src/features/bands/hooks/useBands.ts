import { useQuery } from "@tanstack/react-query";
import { getBand, listBands } from "@/features/bands/services/bands.api";

/** Standardized query keys for the bands feature. */
export const bandKeys = {
  all: ["bands"] as const,
  detail: (id: string) => ["bands", id] as const,
};

/** Server-state query for the owner's bands (saves). */
export function useBands() {
  return useQuery({ queryKey: bandKeys.all, queryFn: listBands });
}

/** Server-state query for a single band with its members. */
export function useBand(id: string) {
  return useQuery({
    queryKey: bandKeys.detail(id),
    queryFn: () => getBand(id),
    enabled: Boolean(id),
  });
}
