import type { Skills } from "@/features/bands";

/** Lifecycle status of a release. */
export type ReleaseStatus = "em_criacao" | "lancada";

/** Release format identifiers (mirrors the backend catalog). */
export type ReleaseFormatId =
  | "single"
  | "ep"
  | "lp"
  | "album"
  | "acoustic"
  | "live";

/** Budget-tier identifiers. */
export type BudgetTierId = "caseiro" | "estudio" | "grande";

/** Languages supported by the release-title generator. */
export type TitleLanguage = "pt" | "en" | "es";

/** Kinds of creation event. */
export type CreationEventKind =
  | "conflito_visao"
  | "ideia_maluca"
  | "perfeccionismo"
  | "preguica";

/** Credits: aspect (one of the six skills) → member ids. */
export type ReleaseCredits = Partial<Record<keyof Skills, string[]>>;

/** One resolved creation event, kept on the finished work. */
export interface ReleaseCreationLogEntry {
  eventId: string;
  prompt: string;
  choiceLabel: string;
  qualityModifier: number;
}

/** The quality breakdown persisted with a finalized release. */
export interface ReleaseDetails {
  skillScore: number;
  moodModifier: number;
  budgetBonus: number;
  eventModifier: number;
  variance: number;
  reach: number;
}

/** A musical work (`ReleaseView`). Outcome fields are null while a draft. */
export interface Release {
  id: string;
  bandId: string;
  title: string;
  concept: string;
  format: string;
  style: string;
  budgetTier: string;
  status: ReleaseStatus;
  credits: ReleaseCredits;
  quality: number | null;
  qualityTier: string | null;
  fansGained: number | null;
  cost: number | null;
  masterRevenueTotal: number | null;
  publishingRevenueTotal: number | null;
  royaltyRemaining: number;
  royaltyTurnsLeft: number;
  releasedAtYear: number | null;
  creationLog: ReleaseCreationLogEntry[];
  details: ReleaseDetails | null;
  createdAt: string;
}

/** A creation-event option shown to the player (odds hidden by the backend). */
export interface CreationEventOption {
  id: string;
  label: string;
  description: string;
}

/** A creation event (`CreationEventView`). */
export interface CreationEvent {
  id: string;
  sequence: number;
  kind: CreationEventKind;
  prompt: string;
  options: CreationEventOption[];
  resolved: boolean;
  chosenOptionId: string | null;
  qualityModifier: number | null;
}

/** A release composed with its creation events (`ReleaseWithEventsView`). */
export interface ReleaseWithEvents extends Release {
  creationEvents: CreationEvent[];
}

/** Display + economic metadata for a release format. */
export interface ReleaseFormat {
  id: ReleaseFormatId;
  label: string;
  minTracks: number;
  maxTracks: number;
  baseCost: number;
  baseReach: number;
  baseRevenue: number;
}

/** Display + economic metadata for a budget tier. */
export interface BudgetTier {
  id: BudgetTierId;
  label: string;
  description: string;
  costMultiplier: number;
  qualityMultiplier: number;
}

/** Display metadata for a quality tier. */
export interface QualityTier {
  id: string;
  label: string;
  emoji: string;
  minQuality: number;
  fansMultiplier: number;
  revenueMultiplier: number;
}

/** Body for starting a release draft. */
export interface StartReleaseInput {
  title: string;
  concept?: string;
  style: string;
  format: ReleaseFormatId;
  budgetTier: BudgetTierId;
  credits: ReleaseCredits;
}

/** Options for the title generator. */
export interface GenerateTitleOptions {
  language?: TitleLanguage;
  count?: number;
}

/** Options for the concept generator. */
export interface GenerateConceptOptions {
  title?: string;
  style?: string;
}
