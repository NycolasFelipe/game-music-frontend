import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bandKeys } from "@/features/bands/hooks/useBands";
import { createBand } from "@/features/bands/services/bands.api";

/** Create-band mutation; invalidates the bands list on success. */
export function useCreateBand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBand,
    onSuccess: (band) => {
      queryClient.invalidateQueries({ queryKey: bandKeys.all });
      queryClient.setQueryData(bandKeys.detail(band.id), band);
    },
  });
}
