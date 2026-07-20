import type {
  ActiveEvent,
  EventResolution,
  PassiveEvent,
} from "@/features/events/types";
import { http } from "@/services/http";

/** Lists a band's active (decision) events, newest first. */
export function listActiveEvents(bandId: string): Promise<ActiveEvent[]> {
  return http.get<ActiveEvent[]>(`/bands/${bandId}/events`);
}

/** Lists a band's passive (timeline) events. */
export function listPassiveEvents(bandId: string): Promise<PassiveEvent[]> {
  return http.get<PassiveEvent[]>(`/bands/${bandId}/passive-events`);
}

/** Resolves an active event by choosing an option. */
export function resolveActiveEvent(
  bandId: string,
  eventId: string,
  optionId: string,
): Promise<EventResolution> {
  return http.post<EventResolution>(
    `/bands/${bandId}/events/${eventId}/resolve`,
    { optionId },
  );
}
