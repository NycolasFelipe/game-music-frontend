import type { AdvanceTurnResult, Turn } from "@/features/turns/types";
import { http } from "@/services/http";

/** Lists a band's recorded turns (its timeline), oldest first. */
export function getTurns(bandId: string): Promise<Turn[]> {
  return http.get<Turn[]>(`/bands/${bandId}/turns`);
}

/** Advances the band's clock by one turn (runs the tick). */
export function advanceTurn(bandId: string): Promise<AdvanceTurnResult> {
  return http.post<AdvanceTurnResult>(`/bands/${bandId}/turns/advance`);
}
