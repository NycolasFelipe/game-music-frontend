/** A recorded turn snapshot from the backend timeline. */
export interface Turn {
  year: number;
  period: string;
  fanCount: number;
  /** Cash balance captured after this turn (null for untracked older turns). */
  balance: number | null;
  /** Average member happiness captured this turn (null when untracked). */
  happinessAvg: number | null;
  /** Average relationship level captured this turn (null when untracked). */
  relationshipAvg: number | null;
  passiveEventId: string | null;
  activeEventId: string | null;
  createdAt: string;
}

import type { FormerMember } from "@/types/former-member";

/** One salary raised by the automatic adjustment during a turn. */
export interface SalaryRaise {
  memberId: string;
  name: string;
  from: number;
  to: number;
}

/** How the work in production moved during a turn (ADR-0015). */
export interface ReleaseProduction {
  releaseId: string;
  title: string;
  /** Turns of production still to run. */
  turnsLeft: number;
  /** Whether the work finished production and can be launched. */
  ready: boolean;
  /** Whether this turn brought up a new studio decision. */
  newSession: boolean;
}

/** Result of advancing a turn (events kept minimal to stay feature-local). */
export interface AdvanceTurnResult {
  previousYear: number;
  year: number;
  period: string;
  agedMembers: boolean;
  passiveEvent: { id: string; description: string } | null;
  activeEvent: { id: string; title: string } | null;
  /** Total salaries owed this turn. */
  salariesDue: number;
  /** Total salaries actually paid from the band's cash this turn. */
  salariesPaid: number;
  /** Whether every member was paid in full this turn. */
  salariesFullyPaid: boolean;
  /** Salaries raised by the automatic adjustment this turn (ADR-0013). */
  salaryRaises: SalaryRaise[];
  /** How the work in production moved this turn (null when not recording). */
  production: ReleaseProduction | null;
  /** Members who left the band this turn, over unpaid salary or a bad mood. */
  departures: FormerMember[];
  /** Ids of members in arrears who risk leaving (no deadline — kept gamified). */
  atRiskMemberIds: string[];
  /** Ids of members in a bad mood who leave if it lasts one more turn. */
  moodAtRiskMemberIds?: string[];
  /** Fans the band lost because members left this turn. */
  fansLostToDepartures?: number;
}

/** What still needs the player this turn (ADR-0022 do backend). */
export interface TurnPendingItem {
  kind: "active-event" | "studio-session" | "release-ready";
  id: string;
  /** The work involved (studio decisions and ready works). */
  releaseId: string | null;
  title: string;
  /** Whether it keeps the turn from advancing. */
  blocking: boolean;
}

/** Expected outcome of playing a circuit now, with the band as it is. */
export interface TurnGigPreview {
  gigTypeId: string;
  label: string;
  minFameLevel: number;
  /** Whether the band's fame already books this circuit. */
  available: boolean;
  /** Performance the venue expects (the mood is judged against it). */
  expectedPerformance: number;
  fee: number;
  cost: number;
  net: number;
  fansGained: number;
  happinessDelta: number;
}

/** One release's royalty in the next advance. */
export interface TurnRoyaltyPayout {
  releaseId: string;
  title: string;
  amount: number;
}

/** The work in the studio, if any. */
export interface TurnStudioRelease {
  id: string;
  title: string;
  format: string;
  turnsLeft: number;
  ready: boolean;
}

/** Everything the Turno screen needs in one call (`GET /bands/:id/turns/panel`). */
export interface TurnPanel {
  year: number;
  period: string;
  /** The band's stage performance now (0..1). */
  performance: number;
  pending: TurnPendingItem[];
  gig: {
    /** The season already played this turn, if any. */
    playedThisTurn: {
      id: string;
      gigTypeId: string;
      net: number;
      fansGained: number;
      performance: number;
      happinessDelta: number;
    } | null;
    previews: TurnGigPreview[];
  };
  activity: { heldThisTurn: boolean };
  studio: {
    release: TurnStudioRelease | null;
    launchesThisYear: number;
    /** Market multiplier the next launch would get (null when the rule is off). */
    nextMarketMultiplier: number | null;
  };
  forecast: {
    balance: number;
    royalties: number;
    royaltyPayouts: TurnRoyaltyPayout[];
    salaryRaises: number;
    payroll: number;
    balanceAfter: number;
    /** Members who would fall into arrears and stay (risk of leaving later). */
    atRiskMemberIds: string[];
    /** Members who would leave the band in this advance over unpaid salary. */
    departingMemberIds?: string[];
    /** Members who would end the advance in a bad mood (leave on the next one). */
    moodAtRiskMemberIds?: string[];
    /** Members who would leave the band in this advance over a bad mood. */
    moodDepartingMemberIds?: string[];
    /** Fans the departures of this advance would cost. */
    fansLost?: number;
  };
}
