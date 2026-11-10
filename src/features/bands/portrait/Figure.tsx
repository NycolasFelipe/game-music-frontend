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
  type PortraitSubject,
} from "@/features/bands/portrait/looks";

const FACE_FEMININE =
  "M42,70 C42,49 50,45 60,45 C70,45 78,49 78,70 C78,85 70,96 60,96 C50,96 42,85 42,70 Z";
const FACE_MASCULINE =
  "M41,70 C41,48 50,44 60,44 C70,44 79,48 79,70 C79,86 71,98 60,98 C49,98 41,86 41,70 Z";
/** A partir deste tom de pele (1..7), os traços do rosto ganham halo de papel. */
const DARK_SKIN = 5;
/** Largura extra do halo de papel sob os traços do rosto. */
const HALO = 1.8;
const BEARD =
  "M41,74 C42,92 50,104 60,104 C70,104 78,92 79,74 C77,86 72,92 66,93 C62,91 58,91 54,93 C48,92 43,86 41,74 Z";

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
  const L = resolveLooks(subject);
  const sk = tone(L.skin);
  const skD = tone(Math.min(9, L.skin + 2));
  const hf = tone(L.hairTone);
  const hs = L.hairOutline ? { stroke: INK, strokeWidth: 1.1 } : {};
  const fem = L.feminine;
  const face = fem ? FACE_FEMININE : FACE_MASCULINE;

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
  ): ReactNode[] =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
      return (
        <circle
          key={`${key}${i}`}
          cx={(cx + rx * Math.cos(a)).toFixed(1)}
          cy={(cy - ry * Math.sin(a)).toFixed(1)}
          r={rad}
          fill={hf}
          {...hs}
        />
      );
    });

  const sad = Math.max(0, -mood);
  const browWidth = fem ? 1.5 : 2.3;
  const browLift = fem ? 1 : 0;
  const curve = (L.beard !== "none" ? 3 : 5) * mood;
  const stache = (
    <path
      d="M52,86.5 C55,83.5 65,83.5 68,86.5 C64,85.8 56,85.8 52,86.5 Z"
      fill={L.beard === "stubble" ? tone(5) : hf}
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
    const w = (base: number) => base + (halo ? HALO : 0);
    const outline = halo ? { stroke: PAPER, strokeWidth: HALO } : {};
    return (
      <g>
        <path
          d={`M46,${66 - browLift} Q51,${63 - browLift} 56,${65.5 - sad * 3}`}
          fill="none"
          stroke={c}
          strokeWidth={w(browWidth)}
          strokeLinecap="round"
        />
        <path
          d={`M74,${66 - browLift} Q69,${63 - browLift} 64,${65.5 - sad * 3}`}
          fill="none"
          stroke={c}
          strokeWidth={w(browWidth)}
          strokeLinecap="round"
        />
        <ellipse cx="51.5" cy="72.5" rx="2.1" ry={mood > 0.7 ? 1 : 1.7} fill={c} {...outline} />
        <ellipse cx="68.5" cy="72.5" rx="2.1" ry={mood > 0.7 ? 1 : 1.7} fill={c} {...outline} />
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
          <g fill="none" stroke={c} strokeWidth={w(1.6)}>
            <circle cx="51.5" cy="72.5" r="5.6" />
            <circle cx="68.5" cy="72.5" r="5.6" />
            <path d="M57,72 Q60,70 63,72 M45.9,71.5 L41,70 M74.1,71.5 L79,70" />
          </g>
        )}
        {L.glasses === "sun" && (
          <>
            <g stroke={c} strokeWidth={w(1.6)}>
              <rect x="44.5" y="68" width="13" height="9" rx="3.5" fill={c} />
              <rect x="62.5" y="68" width="13" height="9" rx="3.5" fill={c} />
              <path d="M57.5,71 Q60,69.5 62.5,71 M44.5,70.5 L41,69.5 M75.5,70.5 L79,69.5" fill="none" />
            </g>
            {!halo && <path d="M47,70.5 L50,70.5 M65,70.5 L68,70.5" stroke={PAPER} strokeWidth="1.2" />}
          </>
        )}
      </g>
    );
  };

  return (
    <g>
      {/* Cabelo de trás */}
      {L.hairStyle === "long" && (
        <path
          d={`M36,66 C34,38 48,32 60,32 C72,32 86,38 84,66 L${fem ? "88,130 C76,136 44,136 32,130" : "86,116 C76,120 44,120 34,116"} Z`}
          fill={hf}
          {...hs}
        />
      )}
      {L.hairStyle === "bob" && (
        <path
          d="M37,64 C35,38 48,33 60,33 C72,33 85,38 83,64 L85,100 C78,103 72,101 71,97 L49,97 C48,101 42,103 35,100 Z"
          fill={hf}
          {...hs}
        />
      )}
      {L.hairStyle === "curlylong" && (
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
      {L.hairStyle === "afro" && (
        <>
          <ellipse cx="60" cy="58" rx="30" ry="30" fill={hf} />
          {curls("ab", 60, 60, 30, 31, -30, 210, 16, 9)}
        </>
      )}
      {L.hairStyle === "bun" && <circle cx="60" cy="31" r="10" fill={hf} {...hs} />}

      {/* Pescoço, tronco e gola */}
      <path d="M51,84 L51,108 C55,114 65,114 69,108 L69,84 Z" fill={sk} stroke={INK} strokeWidth="1" />
      <path d="M51,90 C56,99 64,99 69,90 L69,99 C64,104 56,104 51,99 Z" fill={skD} />
      <path
        d="M6,250 L9,140 C11,122 26,114 47,107 C53,114 67,114 73,107 C94,114 109,122 111,140 L114,250 Z"
        fill={tone(L.shirtTone)}
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

      {/* Orelhas, brincos e mechas da frente */}
      <ellipse cx="41.5" cy="74" rx="4.2" ry="6.5" fill={sk} stroke={INK} strokeWidth="1" />
      <ellipse cx="78.5" cy="74" rx="4.2" ry="6.5" fill={sk} stroke={INK} strokeWidth="1" />
      {L.earring && (
        <>
          <circle cx="41" cy="83" r="2" fill={PAPER} stroke={INK} strokeWidth="1.2" />
          <circle cx="79" cy="83" r="2" fill={PAPER} stroke={INK} strokeWidth="1.2" />
        </>
      )}
      {L.hairStyle === "long" && fem && (
        <>
          <path d="M41,58 C37,82 38,112 33,140 L45,138 C47,112 47,90 46,66 Z" fill={hf} {...hs} />
          <path d="M79,58 C83,82 82,112 87,140 L75,138 C73,112 73,90 74,66 Z" fill={hf} {...hs} />
        </>
      )}

      {/* Rosto com sombra lateral */}
      <clipPath id={`${uid}f`}>
        <path d={face} />
      </clipPath>
      <path d={face} fill={sk} />
      <g clipPath={`url(#${uid}f)`}>
        <ellipse cx="86" cy="76" rx="15" ry="36" fill={skD} />
        <ellipse cx="60" cy="102" rx="22" ry="7" fill={skD} />
      </g>
      <path d={face} fill="none" stroke={INK} strokeWidth="1.3" />

      {/* Barba (antes da boca) */}
      {L.beard === "full" && (
        <>
          <path d={BEARD} fill={hf} {...hs} />
          {stache}
        </>
      )}
      {L.beard === "stubble" && (
        <path d={BEARD} fill={tone(Math.min(9, L.skin + 3))} opacity=".85" />
      )}
      {L.beard === "goatee" && (
        <>
          <path d="M54,94 Q60,92 66,94 L64,103 Q60,106 56,103 Z" fill={hf} {...hs} />
          {stache}
        </>
      )}

      {/* Expressão e óculos; em pele escura, um halo de papel por baixo */}
      {L.skin >= DARK_SKIN && features(true)}
      {features(false)}

      {/* Cabelo da frente */}
      {L.hairStyle === "short" && (
        <path
          d="M41,72 C38,45 50,37 60,37 C71,37 82,45 79,72 C78,62 76,57 72,54.5 C64,52 52,53 46,56.5 C43,60 42,65 41,72 Z"
          fill={hf}
          {...hs}
        />
      )}
      {L.hairStyle === "buzz" && (
        <path
          d="M41.5,68 C40,48 50,42 60,42 C70,42 80,48 78.5,68 C77,58 74,53 70,51 C63,49.5 56,49.5 50,51 C46,53 43,58 41.5,68 Z"
          fill={tone(Math.max(4, L.hairTone - 3))}
        />
      )}
      {L.hairStyle === "quiff" && (
        <path
          d="M41,72 C37,46 44,31 62,29 C76,28 86,38 79,72 C78,61 75,55 69,53 C64,51 57,52 52,55 C47,52 43,60 41,72 Z"
          fill={hf}
          {...hs}
        />
      )}
      {L.hairStyle === "long" && (
        <path
          d="M40,74 C37,44 50,35 60,35 C70,35 83,44 80,74 C78,60 70,48 60,46 C52,48 43,58 40,74 Z"
          fill={hf}
          {...hs}
        />
      )}
      {L.hairStyle === "bob" && (
        <path d="M41,68 C38,43 50,35 60,35 C70,35 82,43 79,68 L78,59 C70,57 50,57 42,59 Z" fill={hf} {...hs} />
      )}
      {L.hairStyle === "bun" && (
        <path
          d="M42,70 C39,46 50,39 60,39 C70,39 81,46 78,70 C76,58 70,51 60,50 C52,51 45,57 42,70 Z"
          fill={hf}
          {...hs}
        />
      )}
      {(L.hairStyle === "curlylong" || L.hairStyle === "curly") &&
        curls("cf", 60, 64, 19, 21, 10, 170, 9, L.hairStyle === "curly" ? 6.5 : 7)}
      {L.hairStyle === "afro" && curls("af", 60, 62, 20, 20, 15, 165, 9, 7)}
      {L.hairStyle === "bald" && (
        <path d="M50,50 Q56,47 62,48" fill="none" stroke={PAPER} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
      )}
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
  const steps = resolveLooks(subject).skin >= 5 ? [4, 3, 2, 1] : [7, 6, 5, 4];
  return (
    <g>
      <rect x="-40" y="-40" width="200" height="300" fill={tone(steps[0])} />
      <ellipse cx={cx} cy={cy} rx="78" ry="88" fill={tone(steps[1])} />
      <ellipse cx={cx} cy={cy} rx="56" ry="64" fill={tone(steps[2])} />
      <ellipse cx={cx} cy={cy} rx="38" ry="44" fill={tone(steps[3])} />
    </g>
  );
}
