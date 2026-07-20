import { useMutation } from "@tanstack/react-query";
import {
  generateBandNames,
  generateCandidates,
  regenerateAvatar,
} from "@/features/bands/services/bands.api";
import type { GenerateNameOptions } from "@/features/bands/types";

/** Mutation that generates member candidates from the backend. */
export function useGenerateCandidates() {
  return useMutation({
    mutationFn: (count: number) => generateCandidates(count),
  });
}

/** Mutation that regenerates a single avatar emoji for a gender. */
export function useRegenerateAvatar() {
  return useMutation({
    mutationFn: (gender: string) => regenerateAvatar(gender),
  });
}

/** Mutation that asks the backend for band-name suggestions. */
export function useGenerateBandNames() {
  return useMutation({
    mutationFn: (options: GenerateNameOptions) => generateBandNames(options),
  });
}
