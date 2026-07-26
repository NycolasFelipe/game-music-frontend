import type {
  ActivityOptions,
  ActivityResult,
  BandActivity,
} from "@/features/activities/types";
import { http } from "@/services/http";

/** Lists the activities on offer, priced for this band. */
export function getActivityOptions(bandId: string): Promise<ActivityOptions> {
  return http.get<ActivityOptions>(`/bands/${bandId}/activities/options`);
}

/** Lists the activities the band has held, newest first. */
export function listBandActivities(bandId: string): Promise<BandActivity[]> {
  return http.get<BandActivity[]>(`/bands/${bandId}/activities`);
}

/** Holds an activity with the chosen guest list. */
export function holdActivity(
  bandId: string,
  activityId: string,
  participantIds: string[],
): Promise<ActivityResult> {
  return http.post<ActivityResult>(`/bands/${bandId}/activities`, {
    activityId,
    participantIds,
  });
}
