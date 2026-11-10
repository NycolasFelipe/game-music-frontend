import type { BandDetail } from "@/features/bands";
import type { AppliedBandChanges } from "@/features/events/types";

/** What the band looked like right before the player answered an event. */
export interface BandSnapshot {
  fanCount: number;
  members: { id: string; name: string; happiness: number }[];
  relationships: { memberAId: string; memberBId: string; level: number }[];
}

/** One line of the "what changed" ledger shown after an event. */
export interface OutcomeChange {
  key: string;
  label: string;
  delta: number;
  /** Fans are whole numbers; humor and relationship use one decimal. */
  unit: "fans" | "humor" | "relationship";
}

/** Humor changes smaller than this are rounding noise and stay hidden. */
const HUMOR_EPSILON = 0.05;

/**
 * Takes a snapshot of the band before an event is resolved, so the result can
 * show what the choice changed.
 *
 * @param band - The band as it is now.
 * @returns The fan count, members' humor and relationship levels.
 */
export function snapshotBand(band: BandDetail): BandSnapshot {
  return {
    fanCount: band.fanCount,
    members: band.members.map(({ id, name, happiness }) => ({ id, name, happiness })),
    relationships: band.relationships.map(({ memberAId, memberBId, level }) => ({ memberAId, memberBId, level })),
  };
}

/**
 * Compares the band before the event with the values the backend applied and
 * lists what moved: fans, each member's humor and each relationship.
 *
 * @param before - The snapshot taken when the player chose.
 * @param applied - The absolute values after the event (`applied` in the response).
 * @returns The non-zero changes, fans first.
 */
export function outcomeChanges(before: BandSnapshot, applied: AppliedBandChanges): OutcomeChange[] {
  const changes: OutcomeChange[] = [];
  const nameOf = (id: string) => before.members.find((m) => m.id === id)?.name ?? "Ex-integrante";

  const fans = applied.fanCount - before.fanCount;
  if (fans !== 0) changes.push({ key: "fans", label: "Fãs", delta: fans, unit: "fans" });

  for (const { memberId, happiness } of applied.memberHappiness) {
    const previous = before.members.find((m) => m.id === memberId)?.happiness;
    if (previous === undefined) continue;
    const delta = Math.round((happiness - previous) * 10) / 10;
    if (Math.abs(delta) < HUMOR_EPSILON) continue;
    changes.push({ key: `humor-${memberId}`, label: `Humor de ${nameOf(memberId)}`, delta, unit: "humor" });
  }

  for (const { memberAId, memberBId, level } of applied.relationshipLevels) {
    const previous = before.relationships.find(
      (r) =>
        (r.memberAId === memberAId && r.memberBId === memberBId) ||
        (r.memberAId === memberBId && r.memberBId === memberAId),
    )?.level;
    if (previous === undefined || previous === level) continue;
    changes.push({
      key: `rel-${memberAId}-${memberBId}`,
      label: `Relação de ${nameOf(memberAId)} e ${nameOf(memberBId)}`,
      delta: level - previous,
      unit: "relationship",
    });
  }

  return changes;
}

/**
 * Formats a change with its sign, in pt-BR.
 *
 * @param change - The ledger line.
 * @returns For example "+1.250", "−0,5" or "+1".
 */
export function formatChange(change: OutcomeChange): string {
  const text = Math.abs(change.delta).toLocaleString("pt-BR", {
    maximumFractionDigits: change.unit === "fans" ? 0 : 1,
  });
  return `${change.delta > 0 ? "+" : "−"}${text}`;
}
