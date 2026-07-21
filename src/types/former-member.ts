/**
 * A former (departed) band member — a snapshot taken when they left. Shared
 * between the `bands` feature (ex-members tab) and the `turns` feature (the
 * departure returned by advancing a turn), so it lives in global `types/`.
 */

/** One relationship the member had at departure. */
export interface FormerMemberRelationship {
  /** The other member's name at the time. */
  memberName: string;
  /** Relationship level (-5..5). */
  level: number;
}

/** Why a member left the band. */
export type DepartureReason = "salario_atrasado";

/** A departed band member (frozen snapshot). Mirrors the backend view. */
export interface FormerMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  /** Happiness at departure. */
  happiness: number;
  characteristics: string[];
  skills: {
    vocal: number;
    guitar: number;
    bass: number;
    drums: number;
    piano: number;
    lyrics: number;
  };
  biography: string;
  primarySkill: string;
  joinYear: number | null;
  /** Last salary before leaving. */
  salary: number;
  /** Consecutive turns unpaid at departure. */
  unpaidTurns: number;
  reason: DepartureReason;
  /** In-game year the member left. */
  leftAtYear: number;
  /** The member's relationships at departure. */
  relationships: FormerMemberRelationship[];
}
