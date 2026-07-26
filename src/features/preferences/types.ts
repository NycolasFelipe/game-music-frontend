/** Ways of looking at the band's people (mirrors the backend). */
export type PeopleViewMode = "cards" | "graph";

/** Account-level preferences, valid across every save (ADR-0018). */
export interface UserPreferences {
  peopleView: PeopleViewMode;
}
