import type { Gig, GigResult, GigType } from "@/features/gigs/types";
import { http } from "@/services/http";

/** Lists the live-circuit catalog. */
export function getGigTypes(): Promise<GigType[]> {
  return http.get<GigType[]>("/gigs/types");
}

/** Lists the band's played seasons, newest first. */
export function listGigs(bandId: string): Promise<Gig[]> {
  return http.get<Gig[]>(`/bands/${bandId}/gigs`);
}

/** Plays the band's live season on a circuit. */
export function playGig(
  bandId: string,
  gigTypeId: string,
): Promise<GigResult> {
  return http.post<GigResult>(`/bands/${bandId}/gigs`, { gigTypeId });
}
