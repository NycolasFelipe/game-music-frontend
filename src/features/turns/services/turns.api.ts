import type { Turn } from "@/features/turns/types";
import { http } from "@/services/http";

/** Lists a band's recorded turns (its timeline), oldest first. */
export function getTurns(bandId: string): Promise<Turn[]> {
  return http.get<Turn[]>(`/bands/${bandId}/turns`);
}
