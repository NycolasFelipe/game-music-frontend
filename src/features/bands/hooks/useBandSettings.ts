import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bandKeys } from "@/features/bands/hooks/useBands";
import { updateBandSettings } from "@/features/bands/services/bands.api";
import type { BandSettings } from "@/features/bands/types";

/**
 * Updates a save's options (ADR-0013). Invalidates the band so every view that
 * reads the option (and the turn tick that obeys it) sees the new value.
 */
export function useUpdateBandSettings(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: BandSettings) =>
      updateBandSettings(bandId, settings),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: bandKeys.detail(bandId) }),
  });
}
