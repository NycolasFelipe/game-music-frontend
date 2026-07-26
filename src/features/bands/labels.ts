import type { SkillLevelDescription, Skills } from "@/features/bands/types";

/** Fixed UI labels for the six skills (pure presentation, not game data). */
export const SKILL_LABELS: Record<keyof Skills, string> = {
  vocal: "Vocal",
  guitar: "Guitarra",
  bass: "Baixo",
  drums: "Bateria",
  piano: "Piano",
  lyrics: "Letras",
};

/** Stable display order for skills. */
export const SKILL_ORDER: Array<keyof Skills> = [
  "vocal",
  "guitar",
  "bass",
  "drums",
  "piano",
  "lyrics",
];

/**
 * Formats a skill level for display. Skills grow with published works (ADR-0012)
 * and carry decimals, so whole levels stay clean ("4") and grown ones show one
 * decimal ("4.6").
 */
export function formatSkillLevel(level: number): string {
  const rounded = Math.round(level * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Resolves the flavor description for a skill level, using the original's
 * bucketing: ≤2 → lvl1, ≤4 → lvl3, ≤6 → lvl5, ≤8 → lvl7, else lvl10.
 */
export function skillLevelDescription(
  list: SkillLevelDescription[] | undefined,
  level: number,
): string {
  if (!list || list.length < 5) return "";
  if (level <= 2) return list[0].description;
  if (level <= 4) return list[1].description;
  if (level <= 6) return list[2].description;
  if (level <= 8) return list[3].description;
  return list[4].description;
}
