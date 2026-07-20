/** A choosable option in an active event. */
export interface ActiveEventOption {
  id: string;
  label: string;
  description: string;
}

/** The rendered effect of an option (numeric deltas are backend-internal). */
export interface EventConsequence {
  resultLabel?: string;
  fanCountChange?: number;
  fanCountChangeAbsolute?: number;
  happinessChangePercent?: number;
  moneyChange?: number;
  description: string;
}

/** An active (decision) event for a band. */
export interface ActiveEvent {
  id: string;
  bandId: string;
  templateId: string;
  year: number;
  type: string;
  title: string;
  description: string;
  involvedCharacterIds: string[];
  options: ActiveEventOption[];
  resolved: boolean;
  chosenOptionId: string | null;
  outcome: EventConsequence | null;
}

/** A passive (timeline/flavor) event. */
export interface PassiveEvent {
  id: string;
  bandId: string;
  templateId: string;
  year: number;
  type: string;
  description: string;
  artists: string[];
}

/** A fame level reached while resolving an event. */
export interface FameMilestone {
  level: number;
  title: string;
  subtitle: string;
}

/** How resolving an event moved the band's fame. */
export interface FameChange {
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  gainedLevels: number;
  milestones: FameMilestone[];
}

/** Result of resolving an active event. */
export interface EventResolution {
  event: ActiveEvent;
  outcome: EventConsequence;
  fameChange: FameChange;
}
