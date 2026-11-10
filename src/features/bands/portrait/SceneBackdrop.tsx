import type { ReactNode } from "react";
import {
  HALFTONE_INK as INK,
  HALFTONE_PAPER as PAPER,
  tone,
} from "@/components/halftone";
import type { PhotoScene } from "@/types/appearance";

/**
 * Fundo da foto de grupo, em preto e branco. Objetos de cena ficam só na faixa
 * de cima (até 18% da altura), acima de qualquer cabeça.
 *
 * @param props.scene - O cenário.
 * @param props.w - Largura do quadro.
 * @param props.h - Altura do quadro.
 */
export function SceneBackdrop({ scene, w, h }: { scene: PhotoScene; w: number; h: number }) {
  const top = h * 0.18;
  const parts: ReactNode[] = [];

  if (scene === "ensaio") {
    parts.push(<rect key="bg" width={w} height={h} fill={tone(9)} />);
    for (let y = 0; y < h; y += 36) {
      for (let x = (y / 36) % 2 ? -18 : 0; x < w; x += 36) {
        parts.push(
          <g key={`f${x}-${y}`}>
            <rect x={x + 3} y={y + 3} width="30" height="30" fill={tone(8)} />
            <path d={`M${x + 3},${y + 3} L${x + 33},${y + 33}`} stroke={INK} strokeWidth="1.2" opacity=".5" />
          </g>,
        );
      }
    }
    parts.push(
      <ellipse key="l1" cx={w / 2} cy={h * 0.42} rx={w * 0.56} ry={h * 0.5} fill={tone(7)} opacity=".9" />,
      <ellipse key="l2" cx={w / 2} cy={h * 0.4} rx={w * 0.4} ry={h * 0.36} fill={tone(5)} opacity=".9" />,
    );
  }

  if (scene === "palco") {
    const n = Math.max(3, Math.round(w / 90));
    const xs = Array.from({ length: n }, (_, i) => (w / n) * (i + 0.5));
    parts.push(<rect key="bg" width={w} height={h} fill={INK} />);
    xs.forEach((x, i) =>
      parts.push(
        <path
          key={`b${i}`}
          d={`M${x - 9},${top * 0.62} L${x + 9},${top * 0.62} L${x + 70},${h} L${x - 70},${h} Z`}
          fill={tone(i % 2 ? 4 : 2)}
          opacity=".75"
        />,
      ),
    );
    parts.push(
      <rect key="truss" x="0" y={top * 0.18} width={w} height={top * 0.3} fill="none" stroke={tone(4)} strokeWidth="2" />,
    );
    for (let x = 0; x < w; x += 14) {
      parts.push(
        <path
          key={`z${x}`}
          d={`M${x},${top * 0.18} L${x + 7},${top * 0.48} L${x + 14},${top * 0.18}`}
          fill="none"
          stroke={tone(4)}
          strokeWidth="1.4"
        />,
      );
    }
    xs.forEach((x, i) =>
      parts.push(
        <g key={`s${i}`}>
          <rect x={x - 9} y={top * 0.42} width="18" height={top * 0.24} rx="2" fill={INK} stroke={PAPER} strokeWidth="1" />
          <rect x={x - 7} y={top * 0.62} width="14" height="2.5" fill={PAPER} />
        </g>,
      ),
    );
  }

  if (scene === "muro") {
    parts.push(<rect key="bg" width={w} height={h} fill={INK} />);
    for (let y = 0, row = 0; y < h; y += 16, row++) {
      for (let x = row % 2 ? -18 : 0; x < w; x += 36) {
        parts.push(
          <rect key={`t${x}-${y}`} x={x + 1.5} y={y + 1.5} width="33" height="13" fill={tone((x + y) % 3 === 0 ? 7 : 6)} />,
        );
      }
    }
    parts.push(
      <ellipse key="l" cx={w / 2} cy={h * 0.5} rx={w * 0.5} ry={h * 0.42} fill={tone(4)} opacity=".35" />,
    );
  }

  if (scene === "estudio") {
    const signWidth = 116;
    parts.push(<rect key="bg" width={w} height={h} fill={tone(8)} />);
    for (let x = 0, i = 0; x < w; x += 16, i++) {
      parts.push(
        <rect key={`r${x}`} x={x + 2} y="0" width="12" height={h} fill={tone(i % 3 === 0 ? 5 : i % 3 === 1 ? 4 : 6)} />,
      );
    }
    parts.push(
      <ellipse key="l" cx={w / 2} cy={h * 0.42} rx={w * 0.42} ry={h * 0.38} fill={tone(3)} opacity=".55" />,
      <rect
        key="sign"
        x={w / 2 - signWidth / 2}
        y={top * 0.2}
        width={signWidth}
        height={top * 0.55}
        rx="3"
        fill={INK}
        stroke={tone(3)}
        strokeWidth="2"
      />,
      <text
        key="signText"
        x={w / 2}
        y={top * 0.2 + top * 0.55 * 0.68}
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontWeight="600"
        fontSize={(top * 0.26).toFixed(1)}
        letterSpacing="1.5"
        fill={PAPER}
      >
        GRAVANDO
      </text>,
    );
  }

  return <g>{parts}</g>;
}
