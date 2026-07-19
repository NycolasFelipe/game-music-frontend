import type { Skills } from "@/features/bands/types";

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
