import { useMutation } from "@tanstack/react-query";
import {
  generateBandName,
  generateCandidates,
} from "@/features/bands/services/bands.api";

/** Mutation that generates member candidates from the backend. */
export function useGenerateCandidates() {
  return useMutation({
    mutationFn: (count: number) => generateCandidates(count),
  });
}

/** Mutation that asks the backend for a random band-name suggestion. */
export function useGenerateBandName() {
  return useMutation({ mutationFn: generateBandName });
}
