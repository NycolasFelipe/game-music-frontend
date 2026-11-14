import { useId } from "react";
import type { ReactNode } from "react";
import {
  HALFTONE_INK as INK,
  HALFTONE_PAPER as PAPER,
  svgId,
  tone,
} from "@/components/halftone";
import {
  moodOf,
  resolveLooks,
  type EarringStyle,
  type PortraitSubject,
} from "@/features/bands/portrait/looks";
import {
  usePortraitTuning,
  type LightHairLevel,
  type SkinLevel,
} from "@/features/bands/portrait/tuning";

const FACE_FEMININE =
  "M42,70 C42,49 50,45 60,45 C70,45 78,49 78,70 C78,85 70,96 60,96 C50,96 42,85 42,70 Z";
const FACE_MASCULINE =
  "M41,70 C41,48 50,44 60,44 C70,44 79,48 79,70 C79,86 71,98 60,98 C49,98 41,86 41,70 Z";
/** Tom do cabelo a partir do qual o recorte de papel separa cabelo e rosto. */
const DARK_HAIR = 8;
/** Tronco com ombros e decote redondo; base de todo corte de roupa. */
const TORSO =
  "M6,250 L9,140 C11,122 26,114 47,107 C53,114 67,114 73,107 C94,114 109,122 111,140 L114,250 Z";
/** Rabo de cavalo, caindo atrás do ombro direito. */
const PONYTAIL =
  "M74,46 C90,50 95,74 91,100 C89,112 85,120 80,127 C79,112 81,94 79,76 C78,62 77,54 74,46 Z";
/** Calota de cabelo rente (coque, rabo de cavalo, tranças). */
const SLICK = "M42,70 C39,46 50,39 60,39 C70,39 81,46 78,70 C76,58 70,51 60,50 C52,51 45,57 42,70 Z";
/** Laterais raspadas (máquina, undercut, moicano). */
const SHAVED =
  "M41.5,68 C40,48 50,42 60,42 C70,42 80,48 78.5,68 C77,58 74,53 70,51 C63,49.5 56,49.5 50,51 C46,53 43,58 41.5,68 Z";
const NECK = "M51,84 L51,108 C55,114 65,114 69,108 L69,84 Z";
const BEARD =
  "M41,74 C42,92 50,104 60,104 C70,104 78,92 79,74 C77,86 72,92 66,93 C62,91 58,91 54,93 C48,92 43,86 41,74 Z";

/**
 * Os brincos, nas duas orelhas (ou só na esquerda, no modelo `single`). Cada
 * peça tem contorno de tinta e miolo de papel, para aparecer sobre pele clara,
 * pele escura e cabelo.
 *
 * @param props.style - O modelo do brinco.
 * @param props.scale - Escala da peça, a partir do furo da orelha.
 * @returns Os brincos em SVG, nas coordenadas da figura.
 */
function Earrings({ style, scale }: { style: Exclude<EarringStyle, "none">; scale: number }) {
  const ears = style === "single" ? [41] : [41, 79];
  const piece = (x: number) => {
    switch (style) {
      case "hoop":
      case "single":
        return (
          <>
            <circle cx={x} cy="87" r="4.4" fill="none" stroke={INK} strokeWidth="2.6" />
            <circle cx={x} cy="87" r="4.4" fill="none" stroke={PAPER} strokeWidth="1" />
          </>
        );
      case "smallhoop":
        return (
          <>
            <circle cx={x} cy="84.5" r="2.6" fill="none" stroke={INK} strokeWidth="2.2" />
            <circle cx={x} cy="84.5" r="2.6" fill="none" stroke={PAPER} strokeWidth="0.8" />
          </>
        );
      case "cross":
        return (
          <>
            <path d={`M${x},82 L${x},93 M${x - 3},85.5 L${x + 3},85.5`} stroke={INK} strokeWidth="2.6" strokeLinecap="square" />
            <path d={`M${x},82 L${x},93 M${x - 3},85.5 L${x + 3},85.5`} stroke={PAPER} strokeWidth="1" strokeLinecap="square" />
          </>
        );
      case "drop":
        return (
          <>
            <path d={`M${x},82 L${x},88`} stroke={INK} strokeWidth="1.2" />
            <circle cx={x} cy="82" r="1.5" fill={PAPER} stroke={INK} strokeWidth="1" />
            <path
              d={`M${x},87 C${x + 3},91 ${x + 3},94 ${x},95 C${x - 3},94 ${x - 3},91 ${x},87 Z`}
              fill={PAPER}
              stroke={INK}
              strokeWidth="1.2"
            />
          </>
        );
      default:
        return <circle cx={x} cy="83" r="2" fill={PAPER} stroke={INK} strokeWidth="1.2" />;
    }
  };
  return (
    <>
      {ears.map((x) => (
        <g key={x} transform={scale === 1 ? undefined : `translate(${x} 83) scale(${scale}) translate(${-x} -83)`}>
          {piece(x)}
        </g>
      ))}
    </>
  );
}

/**
 * Uma pessoa em retícula, em coordenadas locais 120 × 250: cabeça em (60, 70),
 * ombros em y≈108, tronco até 250. Sem fundo; quem usa decide o enquadramento.
 * A expressão (sobrancelhas, olhos e boca) segue o humor.
 *
 * @param props.subject - A pessoa retratada.
 * @param props.mood - Humor normalizado -1..1 (padrão: o da pessoa).
 */
export function Figure({
  subject,
  mood = moodOf(subject),
}: {
  subject: PortraitSubject;
  mood?: number;
}) {
  const uid = svgId(useId());
  const T = usePortraitTuning();
  const L = resolveLooks(subject);
  const skinTone = T.skinTones[L.skin as SkinLevel] ?? L.skin;
  const sk = tone(skinTone, false, T.cellSkin);
  const skD = tone(Math.min(9, skinTone + T.shadeSteps), false, T.cellSkin);
  const hairTone = T.hairTones[L.hairTone as LightHairLevel] ?? L.hairTone;
  const hf = tone(hairTone, false, T.cellHair);
  const hs = L.hairOutline ? { stroke: INK, strokeWidth: T.hairOutline } : {};
  const fem = L.feminine;
  const face = fem ? FACE_FEMININE : FACE_MASCULINE;
  const shirtFill = tone(L.shirtTone, false, T.cellShirt);
  const halo = L.skin >= T.haloFrom;
  /** Recorte de papel entre a cabeça escura e o cabelo escuro, para os dois não se fundirem. */
  const rim = T.rimWidth > 0 && halo && L.hairTone >= DARK_HAIR ? T.rimWidth : 0;
  /** Pintura do cabelo; no recorte, a mesma forma em papel e mais larga. */
  const hairPaint = (cut: boolean) =>
    cut ? { fill: PAPER, stroke: PAPER, strokeWidth: rim * 2 } : { fill: hf, ...hs };
  /** Cabelo raspado: o tom do cabelo três degraus mais claro, sem contorno. */
  const shaved = (cut: boolean) =>
    cut ? hairPaint(true) : { fill: tone(Math.max(4, hairTone - 3), false, T.cellHair) };
  /** Fios de detalhe (risca, elástico, tranças): papel no cabelo escuro, tinta no claro. */
  const strand = L.hairTone >= 6 ? PAPER : INK;
  const hair = L.hairVariant;
  /** Cortes compridos que deixam mechas soltas na frente dos ombros. */
  const looseLong = hair === "long" || hair === "bangs" || hair === "halfup";
  /** Estampa e listras: papel sobre roupa escura, tinta sobre roupa clara. */
  const contrast = L.shirtTone >= 8 ? PAPER : INK;

  const curls = (
    key: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    from: number,
    to: number,
    n: number,
    rad: number,
    cut = false,
    merged = false,
  ): ReactNode[] => {
    const ring = (paint: object, k: string) =>
      Array.from({ length: n + 1 }, (_, i) => {
        const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
        return (
          <circle
            key={`${k}${i}`}
            cx={(cx + rx * Math.cos(a)).toFixed(1)}
            cy={(cy - ry * Math.sin(a)).toFixed(1)}
            r={rad}
            {...paint}
          />
        );
      });
    // Cabelo claro em massa: contorno só por fora, sem um anel em cada cacho.
    if (merged && L.hairOutline && !cut) return [...ring(hairPaint(false), `${key}o`), ...ring({ fill: hf }, key)];
    return ring(hairPaint(cut), key);
  };

  /**
   * Mechas grossas (dreads), cada uma com um fio de papel em volta para não
   * virar uma massa só.
   *
   * @param key - Prefixo das chaves.
   * @param lines - Cada mecha como um caminho SVG.
   * @param width - Espessura da mecha.
   * @param cut - Desenha só o recorte de papel.
   * @returns As mechas.
   */
  const locks = (key: string, lines: string[], width: number, cut = false): ReactNode[] =>
    lines.map((d, i) => (
      <g key={`${key}${i}`} fill="none" strokeLinecap="round">
        {cut ? (
          <path d={d} stroke={PAPER} strokeWidth={width + rim * 2} />
        ) : (
          <>
            <path d={d} stroke={L.hairOutline ? INK : PAPER} strokeWidth={width + 1.4} />
            <path d={d} stroke={hf} strokeWidth={width} />
          </>
        )}
      </g>
    ));

  /**
   * Tranças: contas ovais empilhadas, separadas por fios de papel ou tinta.
   *
   * @param key - Prefixo das chaves.
   * @param xs - Posição horizontal de cada trança.
   * @param from - Altura de onde a trança sai.
   * @param to - Altura da ponta.
   * @returns As tranças.
   */
  const plaits = (key: string, xs: number[], from: number, to: number): ReactNode[] =>
    xs.flatMap((x, j) =>
      Array.from({ length: Math.floor((to - from) / 6.5) }, (_, i) => (
        <ellipse
          key={`${key}${j}-${i}`}
          cx={x + (i % 2 ? 0.6 : -0.6)}
          cy={from + i * 6.5}
          rx="3"
          ry="4"
          fill={hf}
          stroke={L.hairOutline ? INK : strand}
          strokeWidth="0.8"
        />
      )),
    );

  /** Dreads compridos dos lados do rosto, por cima dos ombros. */
  const LONG_LOCS = [
    "M32,58 C29,82 33,106 29,134",
    "M36.5,55 C34,80 37.5,108 35,140",
    "M41.5,57 C39.5,82 42.5,110 41,142",
  ].flatMap((d) => [d, d.replace(/(\d+(?:\.\d+)?),/g, (_, x: string) => `${120 - Number(x)},`)]);
  /** Dreads curtos caindo da linha do cabelo. */
  const SHORT_LOCS = Array.from({ length: 11 }, (_, i) => {
    const a = ((15 + i * 15) * Math.PI) / 180;
    const x = 60 + 21 * Math.cos(a);
    const y = 62 - 22 * Math.sin(a);
    const fall = 7 + (1 - Math.sin(a)) * 9;
    return `M${x.toFixed(1)},${(y - 4).toFixed(1)} L${(x + Math.cos(a) * 2.5).toFixed(1)},${(y + fall).toFixed(1)}`;
  });

  const sad = Math.max(0, -mood);
  const browWidth = (fem ? 1.5 : 2.3) * T.featureWeight;
  const browLift = fem ? 1 : 0;
  const curve = (L.beard !== "none" ? 3 : 5) * mood;
  const stache = (
    <path
      d="M52,86.5 C55,83.5 65,83.5 68,86.5 C64,85.8 56,85.8 52,86.5 Z"
      fill={L.beard === "stubble" ? tone(5, false, T.cellHair) : hf}
    />
  );

  /**
   * Sobrancelhas, olhos, nariz, boca e óculos. Com `halo`, desenha as mesmas
   * formas em papel e mais grossas, para ir por baixo do traço em tinta: em
   * pele escura, sem esse contorno, o traço some na retícula do rosto.
   *
   * @param halo - Desenha o contorno de papel em vez do traço.
   * @returns Os elementos do rosto.
   */
  const features = (halo: boolean): ReactNode => {
    const c = halo ? PAPER : INK;
    const fw = T.featureWeight;
    const w = (base: number) => base * fw + (halo ? T.haloWidth : 0);
    const brow = browWidth + (halo ? T.haloWidth : 0);
    const outline = halo ? { stroke: PAPER, strokeWidth: T.haloWidth } : {};
    const eyeRx = 2.1 * T.eyeSize;
    const eyeRy = (mood > 0.7 ? 1 : 1.7) * T.eyeSize;
    const gs = T.glassesScale;
    /** Óculos na escala dos botões, a partir do centro entre os olhos. */
    const scaled = (node: ReactNode) =>
      gs === 1 ? node : <g transform={`translate(60 72.5) scale(${gs}) translate(-60 -72.5)`}>{node}</g>;
    return (
      <g>
        <path
          d={`M46,${66 - browLift} Q51,${63 - browLift} 56,${65.5 - sad * 3}`}
          fill="none"
          stroke={c}
          strokeWidth={brow}
          strokeLinecap="round"
        />
        <path
          d={`M74,${66 - browLift} Q69,${63 - browLift} 64,${65.5 - sad * 3}`}
          fill="none"
          stroke={c}
          strokeWidth={brow}
          strokeLinecap="round"
        />
        <ellipse cx="51.5" cy="72.5" rx={eyeRx} ry={eyeRy} fill={c} {...outline} />
        <ellipse cx="68.5" cy="72.5" rx={eyeRx} ry={eyeRy} fill={c} {...outline} />
        {fem && <path d="M48,71 L46,69.5 M72,71 L74,69.5" stroke={c} strokeWidth={w(1.1)} strokeLinecap="round" />}
        <path
          d="M60,74 L57.3,82.3 Q60,84.3 62.6,82.6"
          fill="none"
          stroke={c}
          strokeWidth={w(1.3)}
          strokeLinecap="round"
        />
        {mood > 0.55 ? (
          <>
            <path
              d={`M53,88.5 Q60,${88.5 + curve * 1.5} 67,88.5 Z`}
              fill={c}
              stroke={c}
              strokeWidth={w(1.6)}
              strokeLinejoin="round"
            />
            {!halo && <path d="M55.5,89.3 L64.5,89.3" stroke={PAPER} strokeWidth="1.2" />}
          </>
        ) : (
          <path
            d={`M53.5,${89.5 - Math.max(0, -curve) * 0.2} Q60,${89.5 + curve} 66.5,${89.5 - Math.max(0, -curve) * 0.2}`}
            fill="none"
            stroke={c}
            strokeWidth={w(1.8)}
            strokeLinecap="round"
          />
        )}

        {L.glasses === "round" && (
          scaled(
          <g fill="none" stroke={c} strokeWidth={w(1.6)}>
            <circle cx="51.5" cy="72.5" r="5.6" />
            <circle cx="68.5" cy="72.5" r="5.6" />
            <path d="M57,72 Q60,70 63,72 M45.9,71.5 L41,70 M74.1,71.5 L79,70" />
          </g>,
          )
        )}
        {L.glasses === "sun" && (
          scaled(
          <>
            <g stroke={c} strokeWidth={w(1.6)}>
              <rect x="44.5" y="68" width="13" height="9" rx="3.5" fill={c} />
              <rect x="62.5" y="68" width="13" height="9" rx="3.5" fill={c} />
              <path d="M57.5,71 Q60,69.5 62.5,71 M44.5,70.5 L41,69.5 M75.5,70.5 L79,69.5" fill="none" />
            </g>
            {!halo && <path d="M47,70.5 L50,70.5 M65,70.5 L68,70.5" stroke={PAPER} strokeWidth="1.2" />}
          </>,
          )
        )}
      </g>
    );
  };

  /**
   * Cabelo da frente. Com `cut`, as mesmas formas em papel e mais largas, para
   * ir recortadas pelo rosto por baixo do cabelo.
   *
   * @param cut - Desenha o recorte de papel em vez do cabelo.
   * @returns As formas do cabelo da frente.
   */
  const frontHair = (cut: boolean): ReactNode => (
    <>
      {hair === "short" && (
        <path
          d="M41,72 C38,45 50,37 60,37 C71,37 82,45 79,72 C78,62 76,57 72,54.5 C64,52 52,53 46,56.5 C43,60 42,65 41,72 Z"
          {...hairPaint(cut)}
        />
      )}
      {(hair === "buzz" || hair === "undercut" || hair === "mohawk") && <path d={SHAVED} {...shaved(cut)} />}
      {hair === "undercut" && (
        <path
          d="M44,58 C42,42 50,33 61,33 C72,33 80,41 76.5,57 C72,52 64,50 58,51 C52,52 47,54 44,58 Z"
          {...hairPaint(cut)}
        />
      )}
      {hair === "mohawk" && (
        <path d="M54.5,53 C53.5,44 55.5,35 60,31.5 C64.5,35 66.5,44 65.5,53 C62,51.5 58,51.5 54.5,53 Z" {...hairPaint(cut)} />
      )}
      {hair === "fringe" && (
        <path
          d="M41,72 C38,45 50,37 60,37 C71,37 82,45 79,72 C78,65 77,61 75.5,58.5 C72.5,61.5 68.5,61 66.5,57.5 C63.5,61.5 57.5,61.5 55,57.5 C52,61 47.5,61.5 44.5,58.5 C42.5,62 41.5,66 41,72 Z"
          {...hairPaint(cut)}
        />
      )}
      {hair === "quiff" && (
        <path
          d="M41,72 C37,46 44,31 62,29 C76,28 86,38 79,72 C78,61 75,55 69,53 C64,51 57,52 52,55 C47,52 43,60 41,72 Z"
          {...hairPaint(cut)}
        />
      )}
      {hair === "sidepart" && (
        <>
          <path
            d="M41,72 C37,47 47,36 61,36 C74,36 83,45 79,72 C78,63 76,57 71,54 C63,50 50,53 44.5,60 C42.5,64 41.5,68 41,72 Z"
            {...hairPaint(cut)}
          />
          {!cut && <path d="M51,37.5 Q47,44 46,51" fill="none" stroke={strand} strokeWidth="1.2" strokeLinecap="round" />}
        </>
      )}
      {(hair === "long" || hair === "halfup" || hair === "locs") && (
        <path
          d="M40,74 C37,44 50,35 60,35 C70,35 83,44 80,74 C78,60 70,48 60,46 C52,48 43,58 40,74 Z"
          {...hairPaint(cut)}
        />
      )}
      {hair === "bangs" && (
        <path
          d="M40,74 C37,44 50,35 60,35 C70,35 83,44 80,74 C79.5,67 78.5,62.5 77.5,60.5 L42.5,60.5 C41.5,62.5 40.5,67 40,74 Z"
          {...hairPaint(cut)}
        />
      )}
      {hair === "bob" && (
        <path d="M41,68 C38,43 50,35 60,35 C70,35 82,43 79,68 L78,59 C70,57 50,57 42,59 Z" {...hairPaint(cut)} />
      )}
      {(hair === "bun" ||
        hair === "topknot" ||
        hair === "spacebuns" ||
        hair === "ponytail" ||
        hair === "braids") && <path d={SLICK} {...hairPaint(cut)} />}
      {!cut && hair === "braids" && (
        <path
          d="M50,51.5 Q51.5,45 54.5,40.5 M60,50 L60,39.5 M70,51.5 Q68.5,45 65.5,40.5"
          fill="none"
          stroke={L.hairOutline ? INK : strand}
          strokeWidth="1"
        />
      )}
      {!cut && hair === "ponytail" && (
        <rect
          x="76.5"
          y="50.5"
          width="6"
          height="3.6"
          rx="1"
          fill={strand}
          stroke={INK}
          strokeWidth=".8"
          transform="rotate(28 79.5 52.3)"
        />
      )}
      {!cut && hair === "topknot" && (
        <path d="M55,38.4 Q60,40.4 65,38.4" fill="none" stroke={strand} strokeWidth="1.4" strokeLinecap="round" />
      )}
      {(hair === "curlylong" || hair === "curly") &&
        curls("cf", 60, 64, 19, 21, 10, 170, 9, hair === "curly" ? 6.5 : 7, cut)}
      {hair === "afro" && curls("af", 60, 62, 20, 20, 15, 165, 9, 7, cut)}
      {hair === "afrohigh" && curls("af", 60, 61, 20, 21, 15, 165, 9, 7, cut)}
      {hair === "shortlocs" && (
        <>
          <path
            d="M41,66 C39,44 50,36 60,36 C70,36 81,44 79,66 C77,56 72,50 60,49 C48,50 43,56 41,66 Z"
            {...hairPaint(cut)}
          />
          {locks("sl", SHORT_LOCS, 4, cut)}
        </>
      )}
      {!cut && hair === "bald" && (
        <path d="M50,50 Q56,47 62,48" fill="none" stroke={PAPER} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
      )}
    </>
  );

  /**
   * A barba. Com `cut`, a mesma forma em papel e mais larga, para separar a
   * barba escura do rosto escuro.
   *
   * @param cut - Desenha o recorte de papel em vez da barba.
   * @returns A barba.
   */
  const beard = (cut: boolean): ReactNode => (
    <>
      {L.beard === "full" && (
        <>
          <path d={BEARD} {...hairPaint(cut)} />
          {!cut && stache}
        </>
      )}
      {!cut && L.beard === "stubble" && (
        <path d={BEARD} fill={tone(Math.min(9, skinTone + 3), false, T.cellSkin)} opacity=".85" />
      )}
      {L.beard === "goatee" && (
        <>
          <path d="M54,94 Q60,92 66,94 L64,103 Q60,106 56,103 Z" {...hairPaint(cut)} />
          {!cut && stache}
        </>
      )}
    </>
  );

  return (
    <g>
      {/* Cabelo de trás */}
      {(looseLong || hair === "locs") && (
        <path
          d={`M36,66 C34,38 48,32 60,32 C72,32 86,38 84,66 L${fem && hair !== "locs" ? "88,130 C76,136 44,136 32,130" : "86,116 C76,120 44,120 34,116"} Z`}
          fill={hf}
          {...hs}
        />
      )}
      {hair === "bob" && (
        <path
          d="M37,64 C35,38 48,33 60,33 C72,33 85,38 83,64 L85,100 C78,103 72,101 71,97 L49,97 C48,101 42,103 35,100 Z"
          fill={hf}
          {...hs}
        />
      )}
      {hair === "curlylong" && (
        <>
          <path
            d="M34,64 C32,36 48,30 60,30 C72,30 88,36 86,64 L90,126 C76,134 44,134 30,126 Z"
            fill={hf}
          />
          {curls("cb", 60, 64, 28, 30, -10, 190, 14, 8)}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={`cs${i}`}>
              <circle cx={33 - (i % 2) * 2} cy={74 + i * 10} r="8" fill={hf} {...hs} />
              <circle cx={87 + (i % 2) * 2} cy={74 + i * 10} r="8" fill={hf} {...hs} />
            </g>
          ))}
        </>
      )}
      {hair === "afro" && (
        <>
          <ellipse cx="60" cy="58" rx="30" ry="30" fill={hf} />
          {curls("ab", 60, 60, 30, 31, -30, 210, 16, 9, false, true)}
        </>
      )}
      {hair === "afrohigh" && (
        <>
          <ellipse cx="60" cy="50" rx="31" ry="38" fill={hf} />
          {curls("ab", 60, 52, 31, 38, -25, 205, 18, 9, false, true)}
        </>
      )}
      {hair === "bun" && <circle cx="60" cy="31" r="10" fill={hf} {...hs} />}
      {hair === "topknot" && <ellipse cx="60" cy="30" rx="8.5" ry="10" fill={hf} {...hs} />}
      {hair === "halfup" && <circle cx="60" cy="31" r="7" fill={hf} {...hs} />}
      {hair === "spacebuns" && (
        <>
          <circle cx="44" cy="38" r="8.5" fill={hf} {...hs} />
          <circle cx="76" cy="38" r="8.5" fill={hf} {...hs} />
        </>
      )}
      {hair === "ponytail" && <path d={PONYTAIL} fill={hf} {...hs} />}

      {/* Pescoço, tronco e gola */}
      {rim > 0 && <path d={NECK} fill="none" stroke={PAPER} strokeWidth={1 + rim * 2} />}
      <path d={NECK} fill={sk} stroke={INK} strokeWidth="1" />
      {!T.flat && <path d="M51,90 C56,99 64,99 69,90 L69,99 C64,104 56,104 51,99 Z" fill={skD} />}
      <clipPath id={`${uid}t`}>
        <path d={TORSO} />
      </clipPath>
      <path
        d={TORSO}
        fill={L.shirt === "tank" ? sk : L.shirt === "leather" ? INK : shirtFill}
        stroke={INK}
        strokeWidth="1.2"
      />
      {L.shirt === "crew" && (
        <path d="M47,107 C52,117 68,117 73,107" fill="none" stroke={INK} strokeWidth="2.2" />
      )}
      {L.shirt === "v" && (
        <path d="M48,107 L60,128 L72,107 C66,113 54,113 48,107 Z" fill={sk} stroke={INK} strokeWidth="1.4" />
      )}
      {L.shirt === "jacket" && (
        <>
          <path d="M47,107 L58,150 L46,250 L6,250 L9,140 C11,122 26,114 47,107 Z" fill={INK} />
          <path d="M73,107 L62,150 L74,250 L114,250 L111,140 C109,122 94,114 73,107 Z" fill={INK} />
          <path d="M47,107 L54,132 L47,128 M73,107 L66,132 L73,128" fill="none" stroke={PAPER} strokeWidth="1.2" />
        </>
      )}
      {L.shirt === "stripes" && (
        <>
          <g clipPath={`url(#${uid}t)`}>
            {Array.from({ length: 11 }, (_, i) => (
              <rect key={`st${i}`} x="0" y={124 + i * 12} width="120" height="5" fill={contrast} />
            ))}
          </g>
          <path d={TORSO} fill="none" stroke={INK} strokeWidth="1.2" />
          <path d="M47,107 C52,117 68,117 73,107" fill="none" stroke={INK} strokeWidth="2.2" />
        </>
      )}
      {L.shirt === "print" && (
        <>
          <path d="M47,107 C52,117 68,117 73,107" fill="none" stroke={INK} strokeWidth="2.2" />
          <circle cx="60" cy="143" r="15" fill="none" stroke={contrast} strokeWidth="2.2" />
          <path d="M62.5,130 L54,145 L60,145 L57,157 L67,140 L61,140 Z" fill={contrast} />
        </>
      )}
      {L.shirt === "turtleneck" && (
        <>
          <path
            d="M49,86 L49,110 C54,117 66,117 71,110 L71,86 C66,91 54,91 49,86 Z"
            fill={shirtFill}
            stroke={INK}
            strokeWidth="1.6"
          />
          <path
            d="M50,93 C55,98 65,98 70,93 M50,99 C55,104 65,104 70,99 M50,105 C55,110 65,110 70,105"
            fill="none"
            stroke={contrast}
            strokeWidth="1.1"
          />
        </>
      )}
      {L.shirt === "collar" && (
        <>
          <path d="M60,114 L60,250" fill="none" stroke={contrast} strokeWidth="1.2" />
          {[140, 166, 192, 218].map((y) => (
            <circle key={`bt${y}`} cx="63" cy={y} r="1.8" fill={PAPER} stroke={INK} strokeWidth="1" />
          ))}
          <path d="M45,105 L60,114 L52,128 Z" fill={PAPER} stroke={INK} strokeWidth="1.3" />
          <path d="M75,105 L60,114 L68,128 Z" fill={PAPER} stroke={INK} strokeWidth="1.3" />
        </>
      )}
      {L.shirt === "tank" && (
        <path
          d="M26,250 L29,152 C31,134 37,120 42,108 L48,108 C52,124 68,124 72,108 L78,108 C83,120 89,134 91,152 L94,250 Z"
          fill={tone(Math.max(8, L.shirtTone), false, T.cellShirt)}
          stroke={INK}
          strokeWidth="1.3"
        />
      )}
      {L.shirt === "hoodie" && (
        <>
          <path
            d="M38,110 C40,96 50,90 60,90 C70,90 80,96 82,110 C76,121 68,124 60,124 C52,124 44,121 38,110 Z"
            fill={shirtFill}
            stroke={contrast}
            strokeWidth="1.3"
          />
          <path d="M47,107 C52,116 68,116 73,107" fill="none" stroke={contrast} strokeWidth="1.6" />
          <path d="M54,119 L52,152 M66,119 L68,152" fill="none" stroke={contrast} strokeWidth="1.6" />
          <circle cx="52" cy="154" r="2" fill={contrast} />
          <circle cx="68" cy="154" r="2" fill={contrast} />
          <path d="M30,250 L36,206 L84,206 L90,250" fill="none" stroke={contrast} strokeWidth="1.4" />
        </>
      )}
      {L.shirt === "leather" && (
        <>
          <path d="M47,107 C53,114 67,114 73,107 L66,138 L54,138 Z" fill={shirtFill} />
          <path
            d="M47,107 L38,134 L56,142 M73,107 L84,128 L66,140"
            fill="none"
            stroke={PAPER}
            strokeWidth="1.3"
          />
          <path d="M66,140 L58,250" fill="none" stroke={PAPER} strokeWidth="1.6" strokeDasharray="2 2" />
          <path d="M22,196 L42,190 M98,184 L80,190" fill="none" stroke={PAPER} strokeWidth="1.2" />
        </>
      )}

      {/* Orelhas, brincos e mechas da frente */}
      {rim > 0 && (
        <g fill="none" stroke={PAPER} strokeWidth={1 + rim * 2}>
          <ellipse cx="41.5" cy="74" rx="4.2" ry="6.5" />
          <ellipse cx="78.5" cy="74" rx="4.2" ry="6.5" />
        </g>
      )}
      <ellipse cx="41.5" cy="74" rx="4.2" ry="6.5" fill={sk} stroke={INK} strokeWidth="1" />
      <ellipse cx="78.5" cy="74" rx="4.2" ry="6.5" fill={sk} stroke={INK} strokeWidth="1" />
      {L.earring !== "none" && <Earrings style={L.earring} scale={T.earringScale} />}
      {looseLong && fem && (
        <>
          <path d="M41,58 C37,82 38,112 33,140 L45,138 C47,112 47,90 46,66 Z" fill={hf} {...hs} />
          <path d="M79,58 C83,82 82,112 87,140 L75,138 C73,112 73,90 74,66 Z" fill={hf} {...hs} />
        </>
      )}
      {hair === "braids" && plaits("br", [34.5, 40, 80, 85.5], 58, 140)}
      {hair === "locs" && locks("lc", LONG_LOCS, 4.6)}

      {/* Rosto com sombra lateral */}
      <clipPath id={`${uid}f`}>
        <path d={face} />
      </clipPath>
      {rim > 0 && <path d={face} fill="none" stroke={PAPER} strokeWidth={T.faceStroke + rim * 2} />}
      <path d={face} fill={sk} />
      {!T.flat && (
        <g clipPath={`url(#${uid}f)`}>
          <ellipse cx="86" cy="76" rx="15" ry="36" fill={skD} />
          <ellipse cx="60" cy="102" rx="22" ry="7" fill={skD} />
        </g>
      )}
      <path d={face} fill="none" stroke={INK} strokeWidth={T.faceStroke} />

      {/* Barba (antes da boca); no recorte, um contorno de papel dentro do rosto */}
      {rim > 0 && (L.beard === "full" || L.beard === "goatee") && (
        <g clipPath={`url(#${uid}f)`}>{beard(true)}</g>
      )}
      {beard(false)}

      {/* Expressão e óculos; em pele escura, um halo de papel por baixo */}
      {halo && features(true)}
      {features(false)}

      {/* Cabelo da frente; no recorte, um contorno de papel na linha do cabelo */}
      {rim > 0 && <g clipPath={`url(#${uid}f)`}>{frontHair(true)}</g>}
      {frontHair(false)}
    </g>
  );
}

/**
 * Fundo de estúdio para retrato individual: luz em degraus de retícula. Pele
 * clara vai contra fundo escuro e pele escura contra fundo claro.
 *
 * @param props.subject - A pessoa retratada (define o contraste).
 * @param props.cx - Centro horizontal da luz.
 * @param props.cy - Centro vertical da luz.
 */
export function PortraitBackdrop({
  subject,
  cx = 60,
  cy = 70,
}: {
  subject: PortraitSubject;
  cx?: number;
  cy?: number;
}) {
  const T = usePortraitTuning();
  const steps = resolveLooks(subject).skin >= 5 ? [4, 3, 2, 1] : [7, 6, 5, 4];
  const bg = (k: number) => tone(k, false, T.cellBackdrop);
  if (T.flat) return <rect x="-40" y="-40" width="200" height="300" fill={bg(steps[1])} />;
  return (
    <g>
      <rect x="-40" y="-40" width="200" height="300" fill={bg(steps[0])} />
      <ellipse cx={cx} cy={cy} rx="78" ry="88" fill={bg(steps[1])} />
      <ellipse cx={cx} cy={cy} rx="56" ry="64" fill={bg(steps[2])} />
      <ellipse cx={cx} cy={cy} rx="38" ry="44" fill={bg(steps[3])} />
    </g>
  );
}
