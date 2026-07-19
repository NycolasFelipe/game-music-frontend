import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bandKeys } from "@/features/bands/hooks/useBands";
import { deleteBand } from "@/features/bands/services/bands.api";

/** Delete-band mutation; refreshes the saves list and drops the detail cache. */
export function useDeleteBand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBand(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: bandKeys.all });
      queryClient.removeQueries({ queryKey: bandKeys.detail(id) });
    },
  });
}
