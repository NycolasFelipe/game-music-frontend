import {
  cellKey,
  HALFTONE_CELL,
  HALFTONE_FINE_CELL,
  HALFTONE_ID,
  HALFTONE_INK,
  HALFTONE_PAPER,
  HALFTONE_RED,
} from "@/components/halftone/halftone";

/** Raio do ponto para uma cobertura de tinta `c` numa célula `cell` × `cell`. */
function dotRadius(coverage: number, cell: number): number {
  return Math.sqrt((coverage * cell * cell) / Math.PI);
}

/**
 * Define, uma vez por página, os padrões de retícula usados pelos SVGs
 * (`tone()`): nove tons em tinta e nove em vermelho, no espaçamento padrão e no
 * fino dos retratos. Acima de 50% de cobertura
 * o padrão se inverte (pontos de papel sobre tinta), como na impressão.
 *
 * @param props.cells - Espaçamentos extras além do padrão (bancada de calibração).
 */
export function HalftoneDefs({ cells = [] }: { cells?: number[] }) {
  const patterns = [];
  // Um padrão por id: espaçamentos que arredondam para o mesmo id viram um só.
  const byKey = new Map<string, number>([
    [cellKey(HALFTONE_CELL), HALFTONE_CELL],
    [cellKey(HALFTONE_FINE_CELL), HALFTONE_FINE_CELL],
  ]);
  for (const c of cells) if (!byKey.has(cellKey(c))) byKey.set(cellKey(c), c);
  const sizes = [...byKey.values()];
  for (const cell of sizes) {
    const half = (cell / 2).toString();
    for (const [prefix, color] of [
      ["k", HALFTONE_INK],
      ["r", HALFTONE_RED],
    ] as const) {
      for (let k = 1; k <= 9; k++) {
        const coverage = k / 10;
        const inverted = coverage > 0.5;
        const r = dotRadius(inverted ? 1 - coverage : coverage, cell);
        const id = `${HALFTONE_ID}-${cellKey(cell)}${prefix}${k}`;
        patterns.push(
          <pattern
            key={id}
            id={id}
            width={cell.toString()}
            height={cell.toString()}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width={cell.toString()} height={cell.toString()} fill={inverted ? color : HALFTONE_PAPER} />
            <circle
              cx={half}
              cy={half}
              r={r.toFixed(2)}
              fill={inverted ? HALFTONE_PAPER : color}
            />
          </pattern>,
        );
      }
    }
  }

  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: "absolute" }}
    >
      <defs>{patterns}</defs>
    </svg>
  );
}
