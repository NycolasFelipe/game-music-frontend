import type { GigResult } from "@/features/gigs/types";

/**
 * Número com sinal no formato brasileiro (humor e desempenho dos shows).
 *
 * @param value - O número.
 * @param digits - Casas decimais (padrão 2).
 * @returns Por exemplo "+0,33", "−0,10" ou "±0,00".
 */
export function signedNumber(value: number, digits = 2): string {
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return value > 0 ? `+${abs}` : value < 0 ? `−${abs}` : `±${abs}`;
}

/**
 * Manchete do resultado de uma temporada, no tom da revista.
 *
 * @param result - O resultado do show.
 * @returns O título do encarte.
 */
export function gigOutcomeTitle(result: GigResult): string {
  return result.gig.net >= 0 ? "Voltaram com dinheiro no bolso" : "Pagaram para tocar";
}

/**
 * Como a banda se sai diante do que uma casa espera (ADR-0021: o humor muda em
 * `(desempenho − esperado) × 3`). Os degraus trocam o número cru, que ninguém
 * sabia ler, por uma comparação.
 */
export type StageFit = "sobra" | "da-conta" | "devendo" | "engolida";

/** Folga a partir da qual a banda "sobra" (≈ +0,24 de humor). */
const COMFORT_MARGIN = 0.08;
/** Falta até a qual a banda só "fica devendo" (≈ −0,15 de humor). */
const SHORTFALL_MARGIN = -0.05;

/**
 * Classifica o desempenho contra a expectativa da casa.
 *
 * @param performance - Desempenho da banda (0..1).
 * @param expected - O que a casa espera (0..1).
 * @returns O degrau da comparação.
 */
export function stageFit(performance: number, expected: number): StageFit {
  const margin = performance - expected;
  if (margin >= COMFORT_MARGIN) return "sobra";
  if (margin >= 0) return "da-conta";
  if (margin >= SHORTFALL_MARGIN) return "devendo";
  return "engolida";
}

/**
 * A comparação antes do show, para a lista de circuitos.
 *
 * @param fit - O degrau.
 * @returns Por exemplo "a banda dá conta do recado".
 */
export function expectationNote(fit: StageFit): string {
  return {
    sobra: "a banda sobra para essa casa",
    "da-conta": "a banda dá conta do recado",
    devendo: "a casa vai cobrar",
    engolida: "a casa vai engolir a banda",
  }[fit];
}

/**
 * A comparação depois do show, para o resultado.
 *
 * @param fit - O degrau.
 * @returns Por exemplo "Deu conta do recado".
 */
export function reactionNote(fit: StageFit): string {
  return {
    sobra: "A banda sobrou no palco",
    "da-conta": "Deu conta do recado",
    devendo: "Ficou devendo para a casa",
    engolida: "A casa engoliu a banda",
  }[fit];
}

/**
 * Resumo do palco para a matéria de capa: como a banda se sai na casa mais
 * exigente que a fama já libera.
 *
 * @param performance - Desempenho atual da banda (0..1).
 * @param previews - Prévias dos circuitos (com a expectativa de cada casa).
 * @returns Uma ou duas palavras ("Sobra", "Dá conta", "No limite", "Verde").
 */
export function stageStanding(
  performance: number,
  previews: { available: boolean; expectedPerformance: number }[],
): string {
  const open = previews.filter((row) => row.available && row.expectedPerformance > 0);
  const hardest = open.reduce<number | null>(
    (max, row) => (max === null || row.expectedPerformance > max ? row.expectedPerformance : max),
    null,
  );
  if (hardest === null) return "—";
  return {
    sobra: "Sobra",
    "da-conta": "Dá conta",
    devendo: "No limite",
    engolida: "Verde",
  }[stageFit(performance, hardest)];
}
