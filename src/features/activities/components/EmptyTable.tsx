import { HALFTONE_INK as INK, HALFTONE_PAPER as PAPER, tone } from "@/components/halftone";

/**
 * Ilustração em retícula para o Convívio sem nenhuma saída: uma mesa de bar
 * sob uma luminária, dois copos e cadeiras vazias. Preto e branco, como as
 * fotos da revista.
 */
export function EmptyTable() {
  return (
    <figure className="rv-empty-scene">
      <svg viewBox="0 0 300 170" role="img" aria-label="Mesa de bar vazia sob uma luminária">
        <rect width="300" height="170" fill={tone(8)} />
        <rect x="0" y="104" width="300" height="66" fill={tone(9)} />
        <rect x="0" y="102" width="300" height="3" fill={INK} />
        <path d="M128,44 L172,44 L236,170 L64,170 Z" fill={tone(3)} opacity=".8" />
        <rect x="149" y="0" width="2" height="30" fill={INK} />
        <path d="M136,30 L164,30 L176,46 L124,46 Z" fill={INK} />
        <ellipse cx="150" cy="46" rx="12" ry="2.5" fill={PAPER} />
        <rect x="40" y="88" width="34" height="70" fill={INK} />
        <rect x="36" y="118" width="54" height="8" fill={INK} />
        <rect x="226" y="88" width="34" height="70" fill={INK} />
        <rect x="210" y="118" width="54" height="8" fill={INK} />
        <rect x="146" y="124" width="8" height="38" fill={INK} />
        <ellipse cx="150" cy="163" rx="24" ry="4" fill={INK} />
        <ellipse cx="150" cy="120" rx="78" ry="13" fill={tone(1)} stroke={INK} strokeWidth="1.5" />
        <rect x="122" y="99" width="12" height="20" fill={PAPER} stroke={INK} strokeWidth="1.4" />
        <rect x="123.5" y="108" width="9" height="10" fill={tone(4)} />
        <g transform="rotate(78 176 115)">
          <rect x="170" y="104" width="12" height="20" fill={PAPER} stroke={INK} strokeWidth="1.4" />
        </g>
        <path d="M150,96 L150,86 L153,82 L157,82 L160,86 L160,96 Z" fill={INK} transform="translate(-6 20)" />
      </svg>
      <figcaption className="rv-caption">
        Ninguém saiu junto ainda. Por enquanto, a amizade da banda é só contratual.
      </figcaption>
    </figure>
  );
}
