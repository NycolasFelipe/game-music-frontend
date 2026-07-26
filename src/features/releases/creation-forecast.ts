import { SKILL_ORDER } from "@/features/bands";
import type { BandMember, Skills } from "@/features/bands";
import type { ReleaseCredits } from "@/features/releases/types";

/**
 * Client-side forecast of a draft, mirroring the backend's quality formula
 * (ADR-0008 §3) so the creation screen can show what a line-up is worth *before*
 * committing. It is deliberately an estimate: the studio variance (±8%) and the
 * creation events only land server-side, at finalization.
 */

/** Maximum value of a single skill (matches the backend's `SKILL_MAX`). */
const SKILL_MAX = 10;

/** How strongly average happiness shifts quality (`HAPPINESS_QUALITY_WEIGHT`). */
const HAPPINESS_QUALITY_WEIGHT = 0.15;

/** Aspects at or above this weight are the ones a style really depends on. */
const CRUCIAL_WEIGHT = 0.2;

/**
 * Weighted skill score of the credited line-up, in `[0, 1]`. Aspects with no one
 * credited contribute zero — leaving a heavy aspect empty is expensive.
 *
 * @param credits - Aspect → credited member ids.
 * @param members - The band's members.
 * @param weights - The style's per-aspect weights.
 * @returns The skill score in `[0, 1]`.
 */
export function skillScore(
  credits: ReleaseCredits,
  members: BandMember[],
  weights: Record<keyof Skills, number>,
): number {
  const byId = new Map(members.map((member) => [member.id, member]));
  let score = 0;

  for (const aspect of SKILL_ORDER) {
    const weight = weights[aspect] ?? 0;
    const assigned = (credits[aspect] ?? [])
      .map((id) => byId.get(id))
      .filter((member): member is BandMember => member !== undefined);
    if (weight <= 0 || assigned.length === 0) {
      continue;
    }
    const average =
      assigned.reduce((sum, member) => sum + member.skills[aspect], 0) /
      assigned.length;
    score += (average / SKILL_MAX) * weight;
  }

  return Math.min(1, Math.max(0, score));
}

/**
 * Mood multiplier from the average happiness of the credited members (neutral
 * when nobody is credited).
 *
 * @param credits - Aspect → credited member ids.
 * @param members - The band's members.
 * @returns A multiplier around 1 (±`HAPPINESS_QUALITY_WEIGHT`).
 */
export function moodModifier(
  credits: ReleaseCredits,
  members: BandMember[],
): number {
  const creditedIds = new Set(Object.values(credits).flat());
  const credited = members.filter((member) => creditedIds.has(member.id));
  if (credited.length === 0) {
    return 1;
  }
  const average =
    credited.reduce((sum, member) => sum + member.happiness, 0) /
    credited.length;
  return 1 + (average / 5) * HAPPINESS_QUALITY_WEIGHT;
}

/**
 * The quality a draft is heading for (0..100), before the studio variance and
 * the creation-event choices.
 *
 * @param credits - Aspect → credited member ids.
 * @param members - The band's members.
 * @param weights - The style's per-aspect weights.
 * @param budgetMultiplier - The budget tier's quality multiplier.
 * @returns The forecast quality, rounded to a whole number.
 */
export function forecastQuality(
  credits: ReleaseCredits,
  members: BandMember[],
  weights: Record<keyof Skills, number>,
  budgetMultiplier: number,
): number {
  const raw =
    skillScore(credits, members, weights) *
    moodModifier(credits, members) *
    budgetMultiplier;
  return Math.round(Math.min(1, Math.max(0, raw)) * 100);
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
