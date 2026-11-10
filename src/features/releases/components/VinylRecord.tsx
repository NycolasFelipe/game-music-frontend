import { useId } from "react";
import type { ReactNode } from "react";
import {
  HALFTONE_INK as INK,
  HALFTONE_PAPER as PAPER,
  HALFTONE_RED as RED,
  seeded,
  svgId,
  tone,
} from "@/components/halftone";
import type { QualityTier, Release, ReviewTier } from "@/features/releases/types";
import { formatPeriod } from "@/utils/period";
import { formatMoney } from "@/utils/money";

/** Keyframes do disco girando (sessões de estúdio). Renderize uma vez por página. */
export const VINYL_KEYFRAMES = `
@keyframes vinylSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

/**
 * Acabamento por faixa de qualidade (ADR-0002), herdado da estante anterior:
 * fracasso liso, medíocre com aro escuro ("bronze"), sólido com aro claro de
 * fio duplo ("prata"), grande em vinil vermelho ("ouro") e obra-prima com dois
 * discos claros num estojo preto ("diamante duplo").
 */
interface DiscFrame {
  ring: number;
  ringTone?: number;
  doubleRule?: boolean;
  body?: string;
  groove?: string;
  blackCenter?: boolean;
  double?: boolean;
}

const FRAMES: Record<string, DiscFrame> = {
  fracasso: { ring: 0 },
  mediocre: { ring: 5, ringTone: 6 },
  solido: { ring: 6, ringTone: 1, doubleRule: true },
  grande: { ring: 0, body: tone(8, true), groove: PAPER, blackCenter: true },
  "obra-prima": { ring: 0, body: tone(1), groove: INK, blackCenter: true, double: true },
};

const LABEL_DECOR = ["none", "ring", "split", "stripes"] as const;

/** Título curto para o rótulo; título longo vira iniciais ("Céu de Cimento" → "CC"). */
function labelText(title: string): string {
  const base = title.replace(/^Obra /, "");
  if (base.length <= 5) return base;
  const initials = base
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 4);
  return initials || base.slice(0, 4);
}

/** Um disco: corpo, sulcos, reflexo, rótulo sorteado pelo id e furo. */
function DiscBody({
  release,
  cx,
  cy,
  r,
  frame,
  uid,
}: {
  release: Pick<Release, "id" | "title">;
  cx: number;
  cy: number;
  r: number;
  frame: DiscFrame;
  uid: string;
}) {
  const rnd = seeded(`${release.id}:label`);
  const fill = rnd() < 0.5 ? RED : PAPER;
  const other = fill === RED ? PAPER : RED;
  const decor = LABEL_DECOR[Math.floor(rnd() * LABEL_DECOR.length)];
  const inner = r - frame.ring;
  const labelR = inner * (frame.blackCenter ? 0.26 : 0.42);
  const groove = frame.groove ?? PAPER;
  const short = labelText(release.title);
  const fontSize = Math.max(4, labelR * (short.length > 4 ? 0.34 : 0.48));

  const wedge = (a0: number, a1: number) => {
    const p = (a: number) =>
      `${(cx + inner * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(cy + inner * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
    return `M${cx},${cy} L${p(a0)} A${inner},${inner} 0 0 1 ${p(a1)} Z`;
  };
  const grooves: ReactNode[] = [];
  for (let g = labelR + 3; g < inner - 1.5; g += 2.6) {
    grooves.push(
      <circle key={g} cx={cx} cy={cy} r={g.toFixed(1)} fill="none" stroke={groove} strokeWidth=".35" opacity=".45" />,
    );
  }

  let decoration: ReactNode = null;
  if (decor === "ring") {
    decoration = (
      <circle cx={cx} cy={cy} r={labelR * 0.8} fill="none" stroke={fill === RED ? PAPER : INK} strokeWidth="1" />
    );
  } else if (decor === "split") {
    decoration = <rect x={cx - labelR} y={cy + labelR * 0.12} width={labelR * 2} height={labelR} fill={other} />;
  } else if (decor === "stripes") {
    decoration = [0.3, 0.48, 0.66].map((k) => (
      <rect key={k} x={cx - labelR} y={cy + labelR * k} width={labelR * 2} height={labelR * 0.09} fill={other} />
    ));
  }

  return (
    <g className="rv-spin" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {frame.ring > 0 && (
        <>
          <circle cx={cx} cy={cy} r={r} fill={tone(frame.ringTone ?? 6)} stroke={INK} strokeWidth="1.4" />
          {frame.doubleRule && (
            <circle cx={cx} cy={cy} r={r - frame.ring / 2} fill="none" stroke={INK} strokeWidth=".7" />
          )}
        </>
      )}
      <circle cx={cx} cy={cy} r={inner} fill={frame.body ?? INK} stroke={INK} strokeWidth="1.4" />
      <path
        d={`${wedge(-140, -112)} ${wedge(40, 68)}`}
        fill={frame.body ? (groove === INK ? tone(3) : tone(6, true)) : tone(8)}
      />
      {grooves}
      {frame.blackCenter ? (
        <circle cx={cx} cy={cy} r={labelR} fill={INK} />
      ) : (
        <>
          <clipPath id={`${uid}l`}>
            <circle cx={cx} cy={cy} r={labelR} />
          </clipPath>
          <circle cx={cx} cy={cy} r={labelR} fill={fill} />
          <g clipPath={`url(#${uid}l)`}>{decoration}</g>
        </>
      )}
      <text
        x={cx}
        y={cy - labelR * 0.3}
        textAnchor="middle"
        fontFamily="Playfair Display, Georgia, serif"
        fontWeight="900"
        fontSize={fontSize.toFixed(1)}
        fill={frame.blackCenter || fill === RED ? PAPER : INK}
      >
        {short}
      </text>
      <circle cx={cx} cy={cy} r={Math.max(1.6, labelR * 0.1)} fill={PAPER} stroke={INK} strokeWidth=".6" />
    </g>
  );
}

/**
 * Disco de vinil de uma obra (ADR-0002), num quadro 120 × 120. Gira ao passar
 * o mouse quando está dentro de um elemento `.rv-disc-hover`.
 *
 * @param props.release - A obra (id para o rótulo, título e faixa).
 */
export function VinylDisc({
  release,
}: {
  release: Pick<Release, "id" | "title" | "qualityTier">;
}) {
  const uid = svgId(useId());
  const frame = FRAMES[release.qualityTier ?? ""] ?? FRAMES.fracasso;
  return (
    <svg className="rv-disc" viewBox="0 0 120 120" role="img" aria-label={`Disco ${release.title}`}>
      {frame.double ? (
        <>
          <rect x="1" y="1" width="118" height="118" rx="7" fill={INK} />
          <rect x="5" y="5" width="110" height="110" rx="5" fill="none" stroke={PAPER} strokeWidth=".5" opacity=".4" />
          <DiscBody release={release} cx={48.8} cy={59.8} r={40.8} frame={frame} uid={`${uid}a`} />
          <DiscBody release={release} cx={71.2} cy={59.8} r={40.8} frame={frame} uid={`${uid}b`} />
        </>
      ) : (
        <DiscBody release={release} cx={60} cy={60} r={58} frame={frame} uid={uid} />
      )}
    </svg>
  );
}

/**
 * Uma obra lançada como resenha de revista: o disco, a faixa, o título, a
 * primeira frase da crítica, os números e a nota. Clicar abre os detalhes.
 *
 * @param props.release - A obra lançada.
 * @param props.formatLabel - Formato por extenso.
 * @param props.qualityTier - Faixa de qualidade (rótulo).
 * @param props.criticTier - Faixa da crítica.
 * @param props.publicTier - Faixa do público.
 * @param props.onClick - Abre os detalhes.
 */
export function VinylRecord({
  release,
  formatLabel,
  qualityTier,
  criticTier,
  publicTier,
  onClick,
}: {
  release: Release;
  formatLabel: string;
  qualityTier?: QualityTier;
  criticTier?: ReviewTier;
  publicTier?: ReviewTier;
  onClick: () => void;
}) {
  const quote = (release.criticComments ?? [])[0];
  const revenue = (release.masterRevenueTotal ?? 0) + (release.publishingRevenueTotal ?? 0);
  const stars = (tier?: ReviewTier) => (tier ? "★".repeat(tier.stars) + "☆".repeat(5 - tier.stars) : "");

  return (
    <article
      className="rv-disc-hover"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(80px, 120px) 1fr auto",
        gap: 16,
        padding: "14px 0",
        borderBottom: "1px solid var(--rv-ink)",
        cursor: "pointer",
        alignItems: "start",
      }}
    >
      <VinylDisc release={release} />
      <div style={{ minWidth: 0 }}>
        <div className={`rv-tierword ${release.qualityTier === "fracasso" ? "rv-red" : ""}`}>
          {qualityTier?.label ?? release.qualityTier} · {formatLabel}
          {release.releasedAtYear !== null ? ` · ${formatPeriod(release.releasedAtYear)}` : ""}
        </div>
        <div style={{ font: "900 22px/1.1 var(--rv-serif)" }}>
          “<span>{release.title}</span>”
        </div>
        {quote && (
          <p style={{ margin: "6px 0 0" }}>
            <i>"{quote.text}"</i> <span className="rv-caption">— {quote.author}</span>
          </p>
        )}
        <div className="rv-caption">
          +{(release.fansGained ?? 0).toLocaleString("pt-BR")} fãs · receita {formatMoney(revenue)}
          {release.royaltyTurnsLeft > 0 ? ` · royalties por mais ${release.royaltyTurnsLeft} turnos` : ""}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <b style={{ font: "900 34px/1 var(--rv-serif)", display: "block" }}>
          {release.quality !== null ? Math.round(release.quality) : "—"}
        </b>
        <span className="rv-label">nota</span>
        <div className="rv-mono" style={{ fontSize: 12, marginTop: 4 }}>
          crítica {stars(criticTier)} {release.criticScore !== null ? Math.round(release.criticScore) : ""}
        </div>
        <div className="rv-mono" style={{ fontSize: 12 }}>
          público {stars(publicTier)} {release.publicScore !== null ? Math.round(release.publicScore) : ""}
        </div>
      </div>
    </article>
  );
}
