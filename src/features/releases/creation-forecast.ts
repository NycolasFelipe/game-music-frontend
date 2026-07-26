import { SKILL_ORDER } from "@/features/bands";
import type { BandMember, MemberRelationship, Skills } from "@/features/bands";
import type { ReleaseCredits } from "@/features/releases/types";

/**
 * Client-side mirrors of the credit rules the backend applies at finalization
 * (ADR-0014), so the creation screen can show what an assignment implies:
 * how stretched each musician is, what the chemistry of a shared instrument
 * adds, and which aspects a style really leans on.
 */

/** Aspects at or above this weight are the ones a style really depends on. */
const CRUCIAL_WEIGHT = 0.2;

/** Focus factor by number of aspects a member took on (ADR-0014 §1). */
const FOCUS_FACTORS = [1, 1, 0.95, 0.85, 0.72, 0.58, 0.45];

/** How far chemistry can shift a shared aspect (ADR-0014 §2). */
const CHEMISTRY_WEIGHT = 0.12;

/** Maximum relationship level (mirrors `RELATIONSHIP_LEVEL_MAX`). */
const RELATIONSHIP_MAX = 5;

/**
 * How much of themselves a member brings to each part, given how many aspects
 * they took on (ADR-0014 §1).
 *
 * @param aspectCount - Number of aspects the member is credited on.
 * @returns The focus factor in `(0, 1]` (0 when uncredited).
 */
export function focusFactor(aspectCount: number): number {
  if (aspectCount <= 0) return 0;
  return FOCUS_FACTORS[Math.min(aspectCount, FOCUS_FACTORS.length - 1)];
}

/**
 * Counts, per member, how many aspects they are credited on.
 *
 * @param credits - Aspect → credited member ids.
 * @returns Member id → number of aspects.
 */
export function creditLoad(credits: ReleaseCredits): Map<string, number> {
  const load = new Map<string, number>();
  for (const ids of Object.values(credits)) {
    for (const id of new Set(ids ?? [])) {
      load.set(id, (load.get(id) ?? 0) + 1);
    }
  }
  return load;
}

/**
 * Chemistry of the members sharing one aspect (ADR-0014 §2): friends amplify
 * each other, rivals get in each other's way. Neutral for a single member.
 *
 * @param memberIds - The members credited on the aspect.
 * @param relationships - The band's relationships.
 * @returns A multiplier around 1 (±`CHEMISTRY_WEIGHT`).
 */
export function chemistryFactor(
  memberIds: string[],
  relationships: MemberRelationship[] = [],
): number {
  const unique = [...new Set(memberIds)];
  if (unique.length < 2) return 1;

  const levels: number[] = [];
  for (let i = 0; i < unique.length; i += 1) {
    for (let j = i + 1; j < unique.length; j += 1) {
      const pair = relationships.find(
        (rel) =>
          (rel.memberAId === unique[i] && rel.memberBId === unique[j]) ||
          (rel.memberAId === unique[j] && rel.memberBId === unique[i]),
      );
      if (pair) levels.push(pair.level);
    }
  }
  if (levels.length === 0) return 1;

  const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
  return 1 + CHEMISTRY_WEIGHT * (average / RELATIONSHIP_MAX);
}

/**
 * How much an aspect matters to a style, as 1..3 filled stars (a weight of ~1/6
 * is the neutral share of six aspects).
 *
 * @param weight - The aspect's weight in the style profile.
 * @returns The number of filled stars (1..3).
 */
export function importanceStars(weight: number): number {
  if (weight >= 0.24) return 3;
  if (weight >= 0.14) return 2;
  return 1;
}

/**
 * The heavy aspects of a style that nobody is credited on — the warnings worth
 * showing before the player commits.
 *
 * @param credits - Aspect → credited member ids.
 * @param weights - The style's per-aspect weights.
 * @returns The uncovered crucial aspects, heaviest first.
 */
export function uncoveredCrucialAspects(
  credits: ReleaseCredits,
  weights: Record<keyof Skills, number>,
): Array<keyof Skills> {
  return SKILL_ORDER.filter(
    (aspect) =>
      (weights[aspect] ?? 0) >= CRUCIAL_WEIGHT &&
      (credits[aspect]?.length ?? 0) === 0,
  ).sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0));
}

/**
 * The band's best member for an aspect (highest skill), used to hint the player
 * toward the obvious pick.
 *
 * @param members - The band's members.
 * @param aspect - The aspect to rank by.
 * @returns The member id with the highest skill, or `null` for an empty band.
 */
export function bestMemberFor(
  members: BandMember[],
  aspect: keyof Skills,
): string | null {
  let best: BandMember | null = null;
  for (const member of members) {
    if (!best || member.skills[aspect] > best.skills[aspect]) {
      best = member;
    }
  }
  return best && best.skills[aspect] > 0 ? best.id : null;
}
