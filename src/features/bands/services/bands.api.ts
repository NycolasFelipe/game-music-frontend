import type {
  Band,
  BandDetail,
  BandOptions,
  Characteristic,
  CreateBandInput,
  GenerateNameOptions,
  MemberCandidate,
  SkillDescriptions,
} from "@/features/bands/types";
import { http } from "@/services/http";

/** Lists the authenticated user's bands (saves). */
export function listBands(): Promise<Band[]> {
  return http.get<Band[]>("/bands");
}

/** Fetches one band composed with its members and relationships. */
export function getBand(id: string): Promise<BandDetail> {
  return http.get<BandDetail>(`/bands/${id}`);
}

/** Creates a band (a new save) with its initial members. */
export function createBand(input: CreateBandInput): Promise<BandDetail> {
  return http.post<BandDetail>("/bands", input);
}

/** Deletes a band (save) and everything it owns (cascade). */
export function deleteBand(id: string): Promise<void> {
  return http.del<void>(`/bands/${id}`);
}

/** Asks the backend for band-name suggestions (language/article/genre). */
export function generateBandNames(
  options: GenerateNameOptions,
): Promise<{ names: string[] }> {
  return http.post<{ names: string[] }>("/bands/generate-name", options);
}

/** Lists band creation options (themes, origins, decades) with labels. */
export function getBandOptions(): Promise<BandOptions> {
  return http.get<BandOptions>("/bands/options");
}

/** Generates (non-persisted) member candidates from the backend. */
export function generateCandidates(count: number): Promise<MemberCandidate[]> {
  return http.post<MemberCandidate[]>("/band-members/candidates", { count });
}

/** Lists the characteristic (trait) catalog with display data. */
export function listCharacteristics(): Promise<Characteristic[]> {
  return http.get<Characteristic[]>("/band-members/characteristics");
}

/** Lists the per-skill level descriptions (flavor text per instrument level). */
export function getSkillDescriptions(): Promise<SkillDescriptions> {
  return http.get<SkillDescriptions>("/band-members/skill-descriptions");
}
