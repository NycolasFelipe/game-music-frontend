import type {
  BudgetTier,
  GenerateConceptOptions,
  GenerateTitleOptions,
  QualityTier,
  Release,
  ReleaseFormat,
  ReleaseWithEvents,
  StartReleaseInput,
} from "@/features/releases/types";
import { http } from "@/services/http";

/** Lists a band's releases (its discography), newest first. */
export function listReleases(bandId: string): Promise<Release[]> {
  return http.get<Release[]>(`/bands/${bandId}/releases`);
}

/** Fetches one release composed with its creation events. */
export function getRelease(
  bandId: string,
  releaseId: string,
): Promise<ReleaseWithEvents> {
  return http.get<ReleaseWithEvents>(`/bands/${bandId}/releases/${releaseId}`);
}

/** Starts a release draft for a band. */
export function startRelease(
  bandId: string,
  input: StartReleaseInput,
): Promise<Release> {
  return http.post<Release>(`/bands/${bandId}/releases`, input);
}

/** Resolves one creation event of a draft by choosing an option. */
export function resolveCreationEvent(
  bandId: string,
  releaseId: string,
  eventId: string,
  optionId: string,
): Promise<ReleaseWithEvents> {
  return http.post<ReleaseWithEvents>(
    `/bands/${bandId}/releases/${releaseId}/creation-events/${eventId}/resolve`,
    { optionId },
  );
}

/** Finalizes (launches) a draft. */
export function finalizeRelease(
  bandId: string,
  releaseId: string,
): Promise<Release> {
  return http.post<Release>(`/bands/${bandId}/releases/${releaseId}/finalize`);
}

/** Discards a release draft. */
export function cancelRelease(
  bandId: string,
  releaseId: string,
): Promise<void> {
  return http.del<void>(`/bands/${bandId}/releases/${releaseId}`);
}

/** Lists the release-format catalog. */
export function getReleaseFormats(): Promise<ReleaseFormat[]> {
  return http.get<ReleaseFormat[]>("/releases/formats");
}

/** Lists the budget-tier catalog. */
export function getBudgetTiers(): Promise<BudgetTier[]> {
  return http.get<BudgetTier[]>("/releases/budget-tiers");
}

/** Lists the quality-tier ladder. */
export function getQualityTiers(): Promise<QualityTier[]> {
  return http.get<QualityTier[]>("/releases/quality-tiers");
}

/** Asks the backend for release-title suggestions. */
export function generateReleaseTitle(
  options: GenerateTitleOptions,
): Promise<{ titles: string[] }> {
  return http.post<{ titles: string[] }>("/releases/generate-title", options);
}

/** Asks the backend for a concept-album description. */
export function generateReleaseConcept(
  options: GenerateConceptOptions,
): Promise<{ concept: string }> {
  return http.post<{ concept: string }>("/releases/generate-concept", options);
}
