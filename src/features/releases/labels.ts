/** Mantine color per quality-tier id (pure presentation). */
export const QUALITY_TIER_COLORS: Record<string, string> = {
  fracasso: "red",
  mediocre: "gray",
  solido: "blue",
  grande: "orange",
  "obra-prima": "grape",
};

/** Resolves the display color for a quality-tier id. */
export function qualityTierColor(id: string | null): string {
  return (id && QUALITY_TIER_COLORS[id]) || "gray";
}
