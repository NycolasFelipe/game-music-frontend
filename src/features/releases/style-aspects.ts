import { SKILL_LABELS, SKILL_ORDER } from "@/features/bands/labels";
import type { Skills } from "@/features/bands/types";

/** How many aspects the profile names, heaviest first. */
const KEY_ASPECTS = 3;

/**
 * The aspects a style weighs most, heaviest first (ties keep the skill order).
 *
 * @param weights - The style's weight per aspect.
 * @returns The {@link KEY_ASPECTS} heaviest aspects.
 */
export function keyAspects(weights: Record<keyof Skills, number>): (keyof Skills)[] {
  return [...SKILL_ORDER].sort((a, b) => weights[b] - weights[a]).slice(0, KEY_ASPECTS);
}

/**
 * Joins aspect names as a Portuguese list: "guitarra, bateria e vocal".
 *
 * @param aspects - The aspects, in order.
 * @returns The sentence fragment, lowercase.
 */
export function aspectList(aspects: (keyof Skills)[]): string {
  const names = aspects.map((a) => SKILL_LABELS[a].toLowerCase());
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}
