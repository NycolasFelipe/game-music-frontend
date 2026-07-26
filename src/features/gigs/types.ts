/** Live-circuit identifiers (mirrors the backend catalog). */
export type GigTypeId = "covers" | "bar" | "pub" | "casa-shows" | "festival";

/** Display + economic metadata for a live circuit (`GigType`). */
export interface GigType {
  id: GigTypeId;
  label: string;
  description: string;
  /** Minimum fame level required to be booked. */
  minFameLevel: number;
  /** Base seasonal fee, before performance and draw. */
  baseFee: number;
  /** Seasonal cost (travel, gear, crew). */
  cost: number;
  /** Base new fans for the season. */
  baseFans: number;
  /** Happiness the season's grind takes from every member. */
  wear: number;
  /** How much of the audience becomes the band's own fans. */
  ownFansMultiplier: number;
}

/** A live season the band played (`GigView`). */
export interface Gig {
  id: string;
  bandId: string;
  gigTypeId: string;
  playedAtYear: number;
  fee: number;
  cost: number;
  /** `fee - cost`, what landed in the band's cash. */
  net: number;
  fansGained: number;
  /** How well the band played, 0..1. */
  performance: number;
  happinessDelta: number;
  createdAt: string;
}

/** One member's stage skill built on the road. */
export interface GigSkillGain {
  memberId: string;
  name: string;
  skill: string;
  from: number;
  to: number;
}

/** What a played season changed in the band (`GigResultView`). */
export interface GigResult {
  gig: Gig;
  balance: number;
  fanCount: number;
  skillGains: GigSkillGain[];
}
