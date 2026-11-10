import {
  HALFTONE_ID,
  HALFTONE_INK,
  HALFTONE_PAPER,
  HALFTONE_RED,
} from "@/components/halftone/halftone";

/** Raio do ponto para uma cobertura de tinta `c` numa célula 4 × 4. */
function dotRadius(coverage: number): number {
  return Math.sqrt((coverage * 16) / Math.PI);
}

/**
 * Define, uma vez por página, os padrões de retícula usados pelos SVGs
 * (`tone()`): nove tons em tinta e nove em vermelho. Acima de 50% de cobertura
 * o padrão se inverte (pontos de papel sobre tinta), como na impressão.
 */
export function HalftoneDefs() {
  const patterns = [];
  for (const [prefix, color] of [
    ["k", HALFTONE_INK],
    ["r", HALFTONE_RED],
  ] as const) {
    for (let k = 1; k <= 9; k++) {
      const coverage = k / 10;
      const inverted = coverage > 0.5;
      const r = dotRadius(inverted ? 1 - coverage : coverage);
      patterns.push(
        <pattern
          key={`${prefix}${k}`}
          id={`${HALFTONE_ID}-${prefix}${k}`}
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="4" height="4" fill={inverted ? color : HALFTONE_PAPER} />
          <circle
            cx="2"
            cy="2"
            r={r.toFixed(2)}
            fill={inverted ? HALFTONE_PAPER : color}
          />
        </pattern>,
      );
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
