import type { CreationEventKind } from "@/features/releases/types";

/** Nome de cada tipo de sessão de estúdio, como chapéu da matéria. */
export const CREATION_KIND_LABELS: Record<CreationEventKind, string> = {
  conflito_visao: "Conflito de visão",
  ideia_maluca: "Ideia maluca",
  perfeccionismo: "Perfeccionismo",
  preguica: "Preguiça",
};
