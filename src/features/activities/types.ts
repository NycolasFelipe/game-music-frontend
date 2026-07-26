import type { ActiveEvent } from "@/features/events";

/** Activity identifiers (mirrors the backend catalog). */
export type ActivityId = "jantar" | "festa" | "viagem" | "retiro" | "terapia";

/** An activity on offer, already priced for the band (`ActivityOptionView`). */
export interface ActivityOption {
  id: ActivityId;
  label: string;
  description: string;
  emoji: string;
  minParticipants: number;
  maxParticipants: number;
  /** Happiness each participant gains at full effect. */
  happinessGain: number;
  /** Relationship levels each participating pair gains at full effect. */
  relationshipGain: number;
  /** Base chance (0..1) of going wrong, before the guest list's hostility. */
  troubleChance: number;
  /** Server-computed price per guest-list size — never recomputed here. */
  costs: Array<{ participants: number; cost: number }>;
}

/** The priced catalog plus what this turn already did to the effects. */
export interface ActivityOptions {
  heldThisTurn: number;
  /** Effect multiplier the next activity would get (ADR-0017 §2). */
  nextSaturation: number;
  /** Risk each point of hostility on the guest list adds (ADR-0017 §3). */
  hostilityRisk: number;
  /** Ceiling the composed risk never crosses. */
  troubleChanceMax: number;
  activities: ActivityOption[];
}

/** An activity the band held (`BandActivityView`). */
export interface BandActivity {
  id: string;
  bandId: string;
  activityId: string;
  heldAtYear: number;
  cost: number;
  participantIds: string[];
  happinessDelta: number;
  relationshipDelta: number;
  trouble: boolean;
  troubleEventId: string | null;
  createdAt: string;
}

/** What an activity changed (`ActivityResultView`). */
export interface ActivityResult {
  activity: BandActivity;
  balance: number;
  saturation: number;
  troubleChance: number;
  trouble: boolean;
  participants: Array<{
    memberId: string;
    name: string;
    from: number;
    to: number;
  }>;
  relationshipChanges: Array<{
    memberAId: string;
    memberBId: string;
    from: number;
    to: number;
  }>;
  /** The decision the trouble raised, when it did. */
  troubleEvent: ActiveEvent | null;
}
