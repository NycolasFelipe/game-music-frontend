/**
 * Data de cada turno (ADR-0033 do backend). O primeiro turno de um ano cai num
 * dia entre 1º de janeiro e 31 de julho; o segundo, entre 1º de agosto e 31 de
 * dezembro. O dia vem de um hash do id da banda e do turno, então o mesmo save
 * mostra sempre a mesma data. É uma cópia idêntica de
 * `turns/domain/calendar/turn-date.calculator.ts` no backend; os vetores de
 * teste são os mesmos dos dois lados.
 */

/** Uma data do calendário do jogo (mês e dia começam em 1). */
export interface TurnDate {
  year: number;
  month: number;
  day: number;
}

/** Como escrever a data: por extenso (manchetes) ou abreviada (listas). */
export type PeriodStyle = "long" | "short";

const FIRST_TURN_LAST_MONTH = 7;
const DAY_MS = 86_400_000;

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const MONTH_ABBREVIATIONS = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "maio",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];

/** Hash FNV-1a de 32 bits, igual ao do backend. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Sorteia (de forma fixa por banda) o dia de um turno.
 *
 * @param bandId - Id da banda, que serve de semente.
 * @param turnYear - Ano do turno (`.5` marca o segundo turno do ano).
 * @returns A data do turno.
 */
export function turnDate(bandId: string, turnYear: number): TurnDate {
  const year = Math.floor(turnYear);
  const secondTurn = turnYear - year >= 0.5;
  const start = Date.UTC(year, secondTurn ? FIRST_TURN_LAST_MONTH : 0, 1);
  const end = secondTurn
    ? Date.UTC(year + 1, 0, 1)
    : Date.UTC(year, FIRST_TURN_LAST_MONTH, 1);
  const length = Math.round((end - start) / DAY_MS);
  const offset = fnv1a(`${bandId}|${Math.round(turnYear * 2)}`) % length;
  const date = new Date(start + offset * DAY_MS);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/**
 * Escreve a data de um turno: "14 de setembro de 1995" (por extenso) ou
 * "14 set. 1995" (abreviada). O primeiro dia do mês sai como "1º".
 *
 * @param year - Ano do turno (`.5` marca o segundo turno do ano).
 * @param bandId - Id da banda, que fixa o dia.
 * @param style - `long` (padrão) ou `short`.
 * @returns A data escrita.
 */
export function formatPeriod(
  year: number,
  bandId: string,
  style: PeriodStyle = "long",
): string {
  const date = turnDate(bandId, year);
  const day = date.day === 1 ? "1º" : String(date.day);
  if (style === "short") {
    return `${day} ${MONTH_ABBREVIATIONS[date.month - 1]} ${date.year}`;
  }
  return `${day} de ${MONTH_NAMES[date.month - 1]} de ${date.year}`;
}
