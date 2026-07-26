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
  /** Members who left the band this turn over unpaid salary (full snapshots). */
  departures: FormerMember[];
  /** Ids of members in arrears who risk leaving (no deadline — kept gamified). */
  atRiskMemberIds: string[];
}
