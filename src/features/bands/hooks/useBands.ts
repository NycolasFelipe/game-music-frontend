import { useQuery } from "@tanstack/react-query";
import { listBands } from "@/features/bands/services/bands.api";

/** Standardized query keys for the bands feature. */
export const bandKeys = {
  all: ["bands"] as const,
  detail: (id: string) => ["bands", id] as const,
};

/** Server-state query for the owner's bands. */
export function useBands() {
  return useQuery({ queryKey: bandKeys.all, queryFn: listBands });
}
