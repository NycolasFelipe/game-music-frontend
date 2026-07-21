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

/** Mantine color per review-tier id (Metacritic-style red→green, grape on top). */
export const REVIEW_TIER_COLORS: Record<string, string> = {
  massacrado: "red",
  misto: "orange",
  favoravel: "yellow",
  aclamado: "teal",
  consagrado: "green",
  "obra-prima": "grape",
};

/** Resolves the display color for a review-tier id. */
export function reviewTierColor(id: string | null): string {
  return (id && REVIEW_TIER_COLORS[id]) || "gray";
}
