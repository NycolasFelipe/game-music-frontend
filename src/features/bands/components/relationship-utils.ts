import type {
  MemberRelationship,
  RelationshipLevelInfo,
} from "@/features/bands/types";

/** Minimal member shape needed by the relationship visualizations. */
export interface RelationshipMember {
  id: string;
  name: string;
  avatar: string;
}

/** Shared props for every relationship visualization. */
export interface RelationshipsViewProps {
  members: RelationshipMember[];
  relationships: MemberRelationship[];
  levels: RelationshipLevelInfo[];
}

/** First token of a full name. */
export const firstName = (name: string) => name.split(" ")[0];

/** Order-independent key for an unordered member pair. */
export const pairKey = (a: string, b: string) => [a, b].sort().join("|");

/** Mantine color name per relationship level (red hostile → green close). */
export function levelColor(level: number): string {
  if (level <= -3) return "red";
  if (level < 0) return "orange";
  if (level === 0) return "gray";
  if (level <= 2) return "teal";
  return "green";
}

/** Fixed hex per level, for SVG strokes (theme-independent, readable on both). */
export function levelHex(level: number): string {
  if (level <= -3) return "#e03131";
  if (level < 0) return "#e8590c";
  if (level === 0) return "#adb5bd";
  if (level <= 2) return "#0ca678";
  return "#2f9e44";
}

/** Builds `pairKey → level` and `level → info` lookups. */
export function buildLookups(
  relationships: MemberRelationship[],
  levels: RelationshipLevelInfo[],
) {
  const levelByPair = new Map(
    relationships.map((r) => [pairKey(r.memberAId, r.memberBId), r.level]),
  );
  const infoByLevel = new Map(levels.map((l) => [l.level, l]));
  return { levelByPair, infoByLevel };
}
