import { useId } from "react";
import type { ReactNode } from "react";
import { svgId } from "@/components/halftone";
import { Figure, PortraitBackdrop } from "@/features/bands/portrait/Figure";
import type { PortraitSubject } from "@/features/bands/portrait/looks";

/** Recortes prontos do retrato (viewBox no espaço 120 × 250 da figura). */
const CROPS = {
  /** Retrato 3:4, cabeça e ombros. */
  portrait: "0 10 120 160",
  /** Recorte 4:3, mais fechado no rosto (fichas de audição). */
  wide: "0 22 120 90",
} as const;

/**
 * Retrato em retícula de um integrante, num quadro de foto da revista.
 *
 * @param props.subject - A pessoa retratada.
 * @param props.crop - Recorte: `portrait` (3:4) ou `wide` (4:3).
 * @param props.tag - Etiqueta vermelha no canto (ex.: "Em crise").
 */
export function MemberPortrait({
  subject,
  crop = "portrait",
  tag,
}: {
  subject: PortraitSubject;
  crop?: keyof typeof CROPS;
  tag?: ReactNode;
}) {
  return (
    <div className={`rv-photo ${crop === "portrait" ? "rv-portrait" : ""}`}>
      <svg
        viewBox={CROPS[crop]}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Retrato de ${subject.name}`}
      >
        <PortraitBackdrop subject={subject} />
        <Figure subject={subject} />
      </svg>
      {tag && <div className="rv-tag">{tag}</div>}
    </div>
  );
}

/**
 * Rosto recortado em círculo, para usar dentro de outro SVG (mapa de relações).
 *
 * @param props.subject - A pessoa retratada.
 * @param props.x - Centro horizontal no SVG de fora.
 * @param props.y - Centro vertical no SVG de fora.
 * @param props.r - Raio do círculo.
 */
export function FaceThumb({
  subject,
  x,
  y,
  r,
}: {
  subject: PortraitSubject;
  x: number;
  y: number;
  r: number;
}) {
  const clip = `${svgId(useId())}c`;
  return (
    <svg x={x - r} y={y - r} width={r * 2} height={r * 2} viewBox="26 38 68 68" overflow="hidden">
      <clipPath id={clip}>
        <circle cx="60" cy="72" r="34" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <PortraitBackdrop subject={subject} cx={60} cy={72} />
        <Figure subject={subject} />
      </g>
    </svg>
  );
}

/**
 * Rostinho redondo em linha com o texto, no lugar do emoji de avatar
 * (listas, créditos, relações).
 *
 * @param props.subject - A pessoa retratada.
 * @param props.size - Diâmetro em pixels.
 */
export function MemberFace({ subject, size = 22 }: { subject: PortraitSubject; size?: number }) {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={subject.name}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      <FaceThumb subject={subject} x={r} y={r} r={r - 0.5} />
      <circle cx={r} cy={r} r={r - 0.75} fill="none" stroke="var(--rv-ink)" strokeWidth="1.5" />
    </svg>
  );
}
