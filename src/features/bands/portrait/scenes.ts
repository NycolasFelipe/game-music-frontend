import { seeded } from "@/components/halftone";
import type { PhotoScene } from "@/types/appearance";

/** Como cada cenário aparece na etiqueta e na legenda da capa. */
export const SCENE_TEXT: Record<PhotoScene, { tag: string; where: string }> = {
  ensaio: { tag: "Sala de ensaio", where: "na sala de ensaio" },
  palco: { tag: "No palco", where: "no palco" },
  muro: { tag: "Na rua", where: "num muro do centro" },
  estudio: { tag: "Estúdio", where: "no estúdio" },
};

const SCENES = Object.keys(SCENE_TEXT) as PhotoScene[];

/**
 * Cenário da banda: o guardado no backend (ADR-0023) ou, se não vier, um
 * sorteado pelo id da banda, sempre o mesmo para ela.
 *
 * @param bandId - Id da banda (semente do sorteio).
 * @param stored - Cenário devolvido pela API, se houver.
 * @returns O cenário da foto.
 */
export function resolveScene(bandId: string, stored?: PhotoScene | null): PhotoScene {
  if (stored) return stored;
  return SCENES[Math.floor(seeded(`${bandId}:cena`)() * SCENES.length)];
}
