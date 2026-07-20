import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelRelease,
  finalizeRelease,
  getRelease,
  listReleases,
  resolveCreationEvent,
  startRelease,
} from "@/features/releases/services/releases.api";
import type { StartReleaseInput } from "@/features/releases/types";

/** Query keys for the releases feature (nested under the band). */
export const releaseKeys = {
  list: (bandId: string) => ["bands", bandId, "releases"] as const,
  detail: (bandId: string, releaseId: string) =>
    ["bands", bandId, "releases", releaseId] as const,
};

/** A band's discography. */
export function useReleases(bandId: string) {
  return useQuery({
    queryKey: releaseKeys.list(bandId),
    queryFn: () => listReleases(bandId),
    enabled: Boolean(bandId),
  });
}

/** One release with its creation events. */
export function useRelease(bandId: string, releaseId: string | null) {
  return useQuery({
    queryKey: releaseKeys.detail(bandId, releaseId ?? ""),
    queryFn: () => getRelease(bandId, releaseId ?? ""),
    enabled: Boolean(bandId) && Boolean(releaseId),
  });
}

/** Starts a release draft. Refreshes the discography. */
export function useStartRelease(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StartReleaseInput) => startRelease(bandId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: releaseKeys.list(bandId) }),
  });
}

/** Resolves a creation event. Refreshes the release detail. */
export function useResolveCreationEvent(bandId: string, releaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { eventId: string; optionId: string }) =>
      resolveCreationEvent(bandId, releaseId, input.eventId, input.optionId),
    onSuccess: (data) =>
      queryClient.setQueryData(releaseKeys.detail(bandId, releaseId), data),
  });
}

/**
 * Finalizes (launches) a draft. Invalidates everything under the band — the
 * balance and fan count change server-side.
 */
export function useFinalizeRelease(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (releaseId: string) => finalizeRelease(bandId, releaseId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bands", bandId] }),
  });
}

/** Discards a draft. Refreshes the discography. */
export function useCancelRelease(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (releaseId: string) => cancelRelease(bandId, releaseId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: releaseKeys.list(bandId) }),
  });
}
