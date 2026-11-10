import type { MemberAppearance } from "@/types/appearance";
import type {
  MemberRelationship,
  RelationshipLevelInfo,
} from "@/features/bands/types";

/** Minimal member shape needed by the relationship visualizations. */
export interface RelationshipMember {
  id: string;
  name: string;
  avatar: string;
  /** Usados no retrato do nó; sem eles o rosto sai neutro. */
  gender?: string;
  age?: number;
  happiness?: number;
  appearance?: MemberAppearance | null;
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
  if (level < 0) return "red";
  if (level === 0) return "gray";
  return "ink";
}

/** Cor do traço por nível (ADR-0002): hostilidade em vermelho, afinidade em tinta. */
export function levelHex(level: number): string {
  if (level < 0) return "#d4241b";
  if (level === 0) return "#b9b1a3";
  return "#131211";
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
