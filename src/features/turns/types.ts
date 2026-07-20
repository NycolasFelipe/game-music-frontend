/** A recorded turn snapshot from the backend timeline. */
export interface Turn {
  year: number;
  period: string;
  fanCount: number;
  passiveEventId: string | null;
  activeEventId: string | null;
  createdAt: string;
}

/** Result of advancing a turn (events kept minimal to stay feature-local). */
export interface AdvanceTurnResult {
  previousYear: number;
  year: number;
  period: string;
  agedMembers: boolean;
  passiveEvent: { id: string; description: string } | null;
  activeEvent: { id: string; title: string } | null;
}
