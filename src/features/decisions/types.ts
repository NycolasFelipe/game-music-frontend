import type { ActiveEvent } from "@/features/events";
import type { CreationEvent } from "@/features/releases";

/** A band decision waiting for the player (an event in the band's life). */
export interface BandDecision {
  key: string;
  kind: "band";
  event: ActiveEvent;
}

/** A studio session waiting for the player, from the work being recorded. */
export interface StudioDecision {
  key: string;
  kind: "studio";
  releaseId: string;
  releaseTitle: string;
  event: CreationEvent;
  /** 1-based session number and how many the format calls for. */
  index: number;
  total: number;
}

/** A finished work waiting for the player to put it out. */
export interface LaunchDecision {
  key: string;
  kind: "launch";
  releaseId: string;
  releaseTitle: string;
  /** The format's label, so the call to action names the record. */
  formatLabel: string;
}

/** Anything waiting for the player, whether or not it holds the clock. */
export type PendingDecision = BandDecision | StudioDecision | LaunchDecision;
