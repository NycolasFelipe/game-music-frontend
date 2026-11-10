import { HALFTONE_INK as INK, tone } from "@/components/halftone";

/**
 * Ilustração em retícula para o Palco sem nenhuma temporada: cortina, um
 * canhão de luz e um microfone esperando alguém. Preto e branco, como as fotos
 * da revista.
 */
export function EmptyStage() {
  const folds = Array.from({ length: 15 }, (_, i) => i * 20);
  return (
    <figure className="rv-empty-scene">
      <svg viewBox="0 0 300 170" role="img" aria-label="Palco vazio com um microfone sob a luz">
        <rect width="300" height="170" fill={INK} />
        {folds.map((x, i) => (
          <rect key={x} x={x} y="0" width="20" height="124" fill={tone(i % 2 ? 9 : 8)} />
        ))}
        <rect x="0" y="0" width="300" height="10" fill={INK} />
        <rect x="0" y="122" width="300" height="48" fill={tone(7)} />
        <path d="M141,0 L159,0 L222,170 L78,170 Z" fill={tone(3)} opacity=".85" />
        <ellipse cx="150" cy="142" rx="66" ry="12" fill={tone(1)} />
        <path d="M150,140 C170,150 210,146 300,160" fill="none" stroke={INK} strokeWidth="1.6" />
        <ellipse cx="150" cy="140" rx="13" ry="3" fill={INK} />
        <rect x="148.5" y="64" width="3" height="76" fill={INK} />
        <rect x="145" y="50" width="10" height="16" rx="5" fill={INK} />
        <rect x="146" y="57" width="8" height="1.4" fill={tone(3)} />
      </svg>
      <figcaption className="rv-caption">
        Palco vazio, microfone ligado. A primeira temporada ainda não tem data, nem público.
      </figcaption>
    </figure>
  );
}
