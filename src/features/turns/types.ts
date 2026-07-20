/** A recorded turn snapshot from the backend timeline. */
export interface Turn {
  year: number;
  period: string;
  fanCount: number;
  passiveEventId: string | null;
  activeEventId: string | null;
  createdAt: string;
}
