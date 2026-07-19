/** Fame standing derived from a band's fan count (mirrors the backend). */
export interface Fame {
  level: number;
  title: string;
  subtitle: string;
  isMaxLevel: boolean;
  currentLevelMinFans: number;
  currentLevelMaxFans: number | null;
  nextLevelAtFans: number | null;
}

/** A band as returned by list endpoints (`BandView`). */
export interface Band {
  id: string;
  name: string;
  theme: string;
  origin: string;
  foundationYear: number;
  fanCount: number;
  fame: Fame;
  currentYear: number;
  createdAt: string;
  updatedAt: string;
}

/** The six musical skills, each 0..10. */
export interface Skills {
  vocal: number;
  guitar: number;
  bass: number;
  drums: number;
  piano: number;
  lyrics: number;
}

/** A band member as returned by the backend (`BandMemberView`). */
export interface BandMember {
  id: string;
  bandId: string;
  name: string;
  age: number;
  gender: string;
  happiness: number;
  characteristics: string[];
  skills: Skills;
  biography: string;
  primarySkill: string;
  joinYear: number | null;
}

/** A relationship level between two members. */
export interface MemberRelationship {
  memberAId: string;
  memberBId: string;
  level: number;
}

/** A band composed with its members and relationships (`GET /bands/:id`). */
export interface BandDetail extends Band {
  members: BandMember[];
  relationships: MemberRelationship[];
}

/** A member to create together with a band (`POST /bands`). */
export interface CreateBandMemberSeed {
  name: string;
  age: number;
  gender: string;
  happiness: number;
  characteristics: string[];
  skills: Skills;
  biography: string;
  primarySkill: string;
  joinYear?: number;
}

/** Request body for creating a band (a new save). */
export interface CreateBandInput {
  name: string;
  theme: string;
  origin: string;
  foundationYear: number;
  members: CreateBandMemberSeed[];
}

/**
 * A generated (non-persisted) member candidate from the backend. The `id` is a
 * temporary key for UI selection only.
 */
export interface MemberCandidate {
  id: string;
  name: string;
  age: number;
  gender: string;
  happiness: number;
  characteristics: string[];
  skills: Skills;
  biography: string;
  primarySkill: string;
}

/** An id paired with its display label (from the backend). */
export interface LabeledOption {
  id: string;
  label: string;
}

/** Band creation options served by the backend. */
export interface BandOptions {
  themes: LabeledOption[];
  origins: LabeledOption[];
  foundationYears: number[];
}

/** A member characteristic (trait) with display data, from the backend. */
export interface Characteristic {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
}

/** A skill level paired with its flavor description. */
export interface SkillLevelDescription {
  level: number;
  description: string;
}

/** Per-skill level descriptions keyed by skill id, from the backend. */
export type SkillDescriptions = Record<string, SkillLevelDescription[]>;

/** Languages supported by the band-name generator. */
export type NameLanguage = "pt" | "en" | "es";

/** Genre hints supported by the band-name generator. */
export type NameGenre = "rock" | "metal" | "electronic" | "punk";

/** Options sent to the band-name generator endpoint. */
export interface GenerateNameOptions {
  language?: NameLanguage;
  includeArticle?: boolean;
  genre?: NameGenre;
  count?: number;
}
