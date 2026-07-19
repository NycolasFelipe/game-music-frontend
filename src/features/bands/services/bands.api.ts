import type { Band } from "@/features/bands/types";
import { http } from "@/services/http";

/** Lists the authenticated user's bands. */
export function listBands(): Promise<Band[]> {
  return http.get<Band[]>("/bands");
}

/** Fetches one band (with its members) by id. */
export function getBand(id: string): Promise<Band> {
  return http.get<Band>(`/bands/${id}`);
}
