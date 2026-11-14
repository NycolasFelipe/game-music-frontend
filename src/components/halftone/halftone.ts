/**
 * Retícula de impressão (ADR-0002): tons de 0 (papel) a 10 (tinta chapada),
 * desenhados com padrões de pontos definidos uma vez em {@link HalftoneDefs}.
 */
export const HALFTONE_INK = "#131211";
export const HALFTONE_PAPER = "#f2ede3";
export const HALFTONE_RED = "#d4241b";

/** Prefixo dos ids dos padrões no documento. */
export const HALFTONE_ID = "rv-ht";

/** Espaço padrão entre os pontos da retícula, em unidades do SVG que usa o tom. */
export const HALFTONE_CELL = 4;
/** Retícula fina, para os retratos: pontos menores e mais juntos. */
export const HALFTONE_FINE_CELL = 3;

/**
 * Sufixo dos padrões para um espaçamento de retícula. O espaçamento padrão
 * não tem sufixo, para manter os ids de sempre.
 *
 * @param cell - Espaço entre os pontos.
 * @returns O trecho do id que identifica o espaçamento.
 */
export function cellKey(cell: number): string {
  return cell === HALFTONE_CELL ? "" : `c${Math.round(cell * 10)}-`;
}

/**
 * Preenchimento SVG para um tom de retícula.
 *
 * @param level - 0 (papel) a 10 (tinta chapada); valores intermediários usam pontos.
 * @param red - Usa o vermelho de destaque no lugar da tinta (só fora das fotos).
 * @param cell - Espaço entre os pontos. `HALFTONE_CELL` e `HALFTONE_FINE_CELL`
 *   sempre existem; outros valores precisam ser pedidos a `HalftoneDefs` (prop `cells`).
 * @returns Uma cor sólida ou uma referência `url(#…)` para o padrão.
 */
export function tone(level: number, red = false, cell = HALFTONE_CELL): string {
  const k = Math.round(level);
  if (k <= 0) return HALFTONE_PAPER;
  if (k >= 10) return red ? HALFTONE_RED : HALFTONE_INK;
  return `url(#${HALFTONE_ID}-${cellKey(cell)}${red ? "r" : "k"}${k})`;
}

/**
 * Gerador pseudoaleatório determinístico (mulberry32 com hash da semente).
 * A mesma semente sempre gera a mesma sequência.
 *
 * @param seed - Texto de origem (um id, por exemplo).
 * @returns Função que devolve números em [0, 1).
 */
export function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Transforma um id do React (`useId`) em algo seguro para `url(#…)`. */
export function svgId(reactId: string): string {
  return reactId.replace(/[^a-zA-Z0-9_-]/g, "");
}
