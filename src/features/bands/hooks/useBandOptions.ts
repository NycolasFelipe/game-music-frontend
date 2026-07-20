import { useQuery } from "@tanstack/react-query";
import {
  getBandOptions,
  getHappinessLevels,
  getRelationshipLevels,
  getSkillDescriptions,
  listCharacteristics,
} from "@/features/bands/services/bands.api";

/** Static catalog query keys. */
export const catalogKeys = {
  options: ["bands", "options"] as const,
  characteristics: ["band-members", "characteristics"] as const,
  skillDescriptions: ["band-members", "skill-descriptions"] as const,
  relationshipLevels: ["bands", "relationship-levels"] as const,
  happinessLevels: ["band-members", "happiness-levels"] as const,
};

/** Band creation options (themes/origins/decades) from the backend. */
export function useBandOptions() {
  return useQuery({
    queryKey: catalogKeys.options,
    queryFn: getBandOptions,
    staleTime: Infinity,
  });
}

/** The characteristic (trait) catalog from the backend. */
export function useCharacteristics() {
  return useQuery({
    queryKey: catalogKeys.characteristics,
    queryFn: listCharacteristics,
    staleTime: Infinity,
  });
}

/** The per-skill level descriptions from the backend. */
export function useSkillDescriptions() {
  return useQuery({
    queryKey: catalogKeys.skillDescriptions,
    queryFn: getSkillDescriptions,
    staleTime: Infinity,
  });
}

/** The relationship-level display metadata from the backend. */
export function useRelationshipLevels() {
  return useQuery({
    queryKey: catalogKeys.relationshipLevels,
    queryFn: getRelationshipLevels,
    staleTime: Infinity,
  });
}

/** The happiness-level display metadata from the backend. */
export function useHappinessLevels() {
  return useQuery({
    queryKey: catalogKeys.happinessLevels,
    queryFn: getHappinessLevels,
    staleTime: Infinity,
  });
}
