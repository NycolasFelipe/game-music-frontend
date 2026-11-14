import { createContext, useContext } from "react";
import { HALFTONE_FINE_CELL } from "@/components/halftone";

/** Tons de pele que o avatar produz (ver `resolveLooks`). */
export const SKIN_LEVELS = [1, 2, 3, 5, 7] as const;
export type SkinLevel = (typeof SKIN_LEVELS)[number];

/** Tons de cabelo claro que o avatar produz: branco (1), loiro (2) e ruivo (7). */
export const LIGHT_HAIR_LEVELS = [1, 2, 7] as const;
export type LightHairLevel = (typeof LIGHT_HAIR_LEVELS)[number];

/**
 * Os botões do gerador de retratos. {@link DEFAULT_PORTRAIT_TUNING} é o desenho
 * do jogo (a "Retícula fina" escolhida na calibração); quem não estiver dentro
 * de um provider usa esses valores.
 *
 * Medidas em unidades da figura (120 × 250), salvo indicação.
 */
export interface PortraitTuning {
  /** Contorno de tinta do rosto. */
  faceStroke: number;
  /** Multiplica a largura de sobrancelhas, nariz, boca, cílios e armação dos óculos. */
  featureWeight: number;
  /** Multiplica o tamanho dos olhos. */
  eyeSize: number;
  /** Tom de pele (1..7) a partir do qual entram o halo e o recorte de papel; 8 desliga. */
  haloFrom: number;
  /** Largura extra do halo de papel sob os traços do rosto. */
  haloWidth: number;
  /** Recorte de papel entre a cabeça (rosto, orelhas, pescoço) e o cabelo escuro; 0 desliga. */
  rimWidth: number;
  /** Tom de retícula (1..9) de cada tom de pele. */
  skinTones: Record<SkinLevel, number>;
  /** Tom de retícula (1..9) do cabelo branco (1), loiro (2) e ruivo (7). */
  hairTones: Record<LightHairLevel, number>;
  /** Degraus a mais de tinta na sombra lateral do rosto e do pescoço. */
  shadeSteps: number;
  /** Espaço entre os pontos da retícula na pele. */
  cellSkin: number;
  /** Espaço entre os pontos da retícula no cabelo e na barba. */
  cellHair: number;
  /** Espaço entre os pontos da retícula na roupa. */
  cellShirt: number;
  /** Espaço entre os pontos da retícula no fundo do retrato. */
  cellBackdrop: number;
  /** Contorno de tinta no cabelo claro (loiro, ruivo, branco). */
  hairOutline: number;
  /** Escala dos brincos. */
  earringScale: number;
  /** Escala dos óculos. */
  glassesScale: number;
  /** Rostinhos menores que isto (px) usam os ajustes de tamanho pequeno; 0 desliga. */
  smallBelow: number;
  /** No tamanho pequeno: multiplica traços e olhos. */
  smallWeight: number;
  /** No tamanho pequeno: multiplica o espaço entre os pontos (pontos maiores e em menor número). */
  smallCell: number;
  /** No tamanho pequeno: tira a sombra do rosto e os degraus de luz do fundo. */
  smallFlat: boolean;
  /** No tamanho pequeno: aproxima o enquadramento do rosto. */
  smallZoom: number;
}

export const DEFAULT_PORTRAIT_TUNING: PortraitTuning = {
  faceStroke: 1.3,
  featureWeight: 1,
  eyeSize: 1,
  haloFrom: 5,
  haloWidth: 1.8,
  rimWidth: 1,
  skinTones: { 1: 1, 2: 2, 3: 3, 5: 5, 7: 7 },
  hairTones: { 1: 1, 2: 2, 7: 7 },
  shadeSteps: 2,
  cellSkin: HALFTONE_FINE_CELL,
  cellHair: HALFTONE_FINE_CELL,
  cellShirt: HALFTONE_FINE_CELL,
  cellBackdrop: HALFTONE_FINE_CELL,
  hairOutline: 1.1,
  earringScale: 1,
  glassesScale: 1,
  smallBelow: 0,
  smallWeight: 1,
  smallCell: 1,
  smallFlat: false,
  smallZoom: 1,
};

/** O que o desenho lê: os botões e se o retrato está no tamanho pequeno. */
export interface PortraitTuningValue {
  tuning: PortraitTuning;
  small: boolean;
}

export const PortraitTuningContext = createContext<PortraitTuningValue>({
  tuning: DEFAULT_PORTRAIT_TUNING,
  small: false,
});

/** Valores efetivos para um retrato, já com os ajustes de tamanho pequeno aplicados. */
export interface ResolvedTuning extends Omit<PortraitTuning, "smallFlat" | "smallZoom"> {
  /** Sem sombra no rosto e sem degraus de luz no fundo. */
  flat: boolean;
  /** Aproximação do enquadramento do rostinho. */
  zoom: number;
}

/**
 * Aplica os ajustes de tamanho pequeno.
 *
 * @param value - Os botões e o tamanho.
 * @returns Os valores que o desenho usa.
 */
export function resolveTuning({ tuning: t, small }: PortraitTuningValue): ResolvedTuning {
  if (!small) return { ...t, flat: false, zoom: 1 };
  return {
    ...t,
    faceStroke: t.faceStroke * t.smallWeight,
    featureWeight: t.featureWeight * t.smallWeight,
    eyeSize: t.eyeSize * t.smallWeight,
    hairOutline: t.hairOutline * t.smallWeight,
    cellSkin: t.cellSkin * t.smallCell,
    cellHair: t.cellHair * t.smallCell,
    cellShirt: t.cellShirt * t.smallCell,
    cellBackdrop: t.cellBackdrop * t.smallCell,
    flat: t.smallFlat,
    zoom: t.smallZoom,
  };
}

/** Valores efetivos do retrato no ponto da árvore em que é chamado. */
export function usePortraitTuning(): ResolvedTuning {
  return resolveTuning(useContext(PortraitTuningContext));
}

/** Os botões crus e o estado de tamanho pequeno (para quem precisa repassar o contexto). */
export function usePortraitTuningValue(): PortraitTuningValue {
  return useContext(PortraitTuningContext);
}

/**
 * Lista os espaçamentos de retícula que uma configuração usa, para que a página
 * defina os padrões correspondentes em `HalftoneDefs`.
 *
 * @param tunings - As configurações em uso.
 * @returns Os espaçamentos distintos, incluindo os do tamanho pequeno.
 */
export function tuningCells(tunings: PortraitTuning[]): number[] {
  const cells = new Set<number>();
  for (const t of tunings) {
    for (const small of [false, true]) {
      const r = resolveTuning({ tuning: t, small });
      for (const c of [r.cellSkin, r.cellHair, r.cellShirt, r.cellBackdrop]) cells.add(c);
    }
  }
  return [...cells];
}
