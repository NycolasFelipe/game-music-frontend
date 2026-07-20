import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generateReleaseConcept,
  generateReleaseTitle,
  getBudgetTiers,
  getQualityTiers,
  getReleaseFormats,
} from "@/features/releases/services/releases.api";
import type {
  GenerateConceptOptions,
  GenerateTitleOptions,
} from "@/features/releases/types";

/** Static release-catalog query keys. */
export const releaseCatalogKeys = {
  formats: ["releases", "formats"] as const,
  budgetTiers: ["releases", "budget-tiers"] as const,
  qualityTiers: ["releases", "quality-tiers"] as const,
};

/** The release-format catalog from the backend. */
export function useReleaseFormats() {
  return useQuery({
    queryKey: releaseCatalogKeys.formats,
    queryFn: getReleaseFormats,
    staleTime: Infinity,
  });
}

/** The budget-tier catalog from the backend. */
export function useBudgetTiers() {
  return useQuery({
    queryKey: releaseCatalogKeys.budgetTiers,
    queryFn: getBudgetTiers,
    staleTime: Infinity,
  });
}

/** The quality-tier ladder from the backend. */
export function useQualityTiers() {
  return useQuery({
    queryKey: releaseCatalogKeys.qualityTiers,
    queryFn: getQualityTiers,
    staleTime: Infinity,
  });
}

/** Generates release-title suggestions (no side effects). */
export function useGenerateReleaseTitle() {
  return useMutation({
    mutationFn: (options: GenerateTitleOptions) =>
      generateReleaseTitle(options),
  });
}

/** Generates a concept-album description (no side effects). */
export function useGenerateReleaseConcept() {
  return useMutation({
    mutationFn: (options: GenerateConceptOptions) =>
      generateReleaseConcept(options),
  });
}
