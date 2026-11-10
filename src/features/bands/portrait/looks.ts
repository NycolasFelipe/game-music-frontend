import { seeded } from "@/components/halftone";
import type {
  BeardStyle,
  GlassesStyle,
  HairStyle,
  MemberAppearance,
  ShirtStyle,
  ShirtTone,
} from "@/types/appearance";

/** Quem pode aparecer numa foto: integrante, candidato ou ex-integrante. */
export interface PortraitSubject {
  id: string;
  name: string;
  gender: string;
  age: number;
  avatar: string;
  happiness: number;
  appearance?: MemberAppearance | null;
}

/** Tudo o que o desenho precisa saber sobre a pessoa. */
export interface Looks {
  /** Tom de pele na retícula (1 claro … 7 escuro). */
  skin: number;
  feminine: boolean;
  hairStyle: HairStyle;
  /** Tom do cabelo (1 branco … 10 preto). */
  hairTone: number;
  /** Contorno para cabelo claro ou médio não sumir no fundo. */
  hairOutline: boolean;
  beard: BeardStyle;
  glasses: GlassesStyle;
  earring: boolean;
  shirt: ShirtStyle;
  shirtTone: ShirtTone;
}

const SKIN_BY_MODIFIER: [string, number][] = [
  ["\u{1F3FB}", 1],
  ["\u{1F3FC}", 2],
  ["\u{1F3FD}", 3],
  ["\u{1F3FE}", 5],
  ["\u{1F3FF}", 7],
];

/**
 * Aparência sorteada a partir do id, com as mesmas regras do backend
 * (ADR-0023). Só é usada quando a API ainda não devolve `appearance`.
 */
function fallbackAppearance(subject: PortraitSubject, curly: boolean, bald: boolean): MemberAppearance {
  const r = seeded(subject.id || subject.name);
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(r() * list.length)];
  const feminine = subject.gender === "female";
  const neutral = subject.gender === "neutral";
  const hairStyle: HairStyle = bald
    ? "bald"
    : feminine
      ? curly
        ? "curlylong"
        : pick(["long", "long", "bob", "bun", "long"] as const)
      : neutral
        ? curly
          ? pick(["curly", "afro", "curlylong"] as const)
          : pick(["short", "long", "bob", "buzz", "bun"] as const)
        : curly
          ? pick(["curly", "afro"] as const)
          : pick(["short", "quiff", "long", "buzz", "short"] as const);
  const beard: BeardStyle =
    subject.gender === "male" && subject.age >= 19 && r() < 0.45
      ? pick(["stubble", "full", "goatee"] as const)
      : "none";
  const g = r();
  const glasses: GlassesStyle = g < 0.12 ? "sun" : g < 0.27 ? "round" : "none";
  const earring = r() < (feminine ? 0.55 : neutral ? 0.35 : 0.15);
  const shirt = pick(["crew", "v", "jacket", "crew"] as const);
  const shirtTone = pick([10, 8, 6, 4] as const);
  return { hairStyle, beard, glasses, earring, shirt, shirtTone };
}

/**
 * Junta o que vem do avatar (pele, cor e cacho do cabelo) com a aparência
 * guardada no backend, ou sorteada pelo id quando ela não vier.
 *
 * @param subject - A pessoa retratada.
 * @returns Os parâmetros de desenho.
 */
export function resolveLooks(subject: PortraitSubject): Looks {
  const avatar = subject.avatar ?? "";
  const skin = SKIN_BY_MODIFIER.find(([mod]) => avatar.includes(mod))?.[1] ?? 2;
  const curly = avatar.includes("\u{1F9B1}");
  const red = avatar.includes("\u{1F9B0}");
  const white = avatar.includes("\u{1F9B3}");
  const bald = avatar.includes("\u{1F9B2}");
  const blond = avatar.startsWith("\u{1F471}");
  const appearance = subject.appearance ?? fallbackAppearance(subject, curly, bald);
  const darkHair = seeded(`${subject.id}:hair`)();
  const hairTone = red ? 7 : white ? 1 : blond ? 2 : skin >= 5 ? 10 : darkHair < 0.5 ? 10 : darkHair < 0.75 ? 9 : 8;

  return {
    skin,
    feminine: subject.gender === "female",
    hairStyle: appearance.hairStyle,
    hairTone,
    hairOutline: red || white || blond,
    beard: appearance.beard,
    glasses: appearance.glasses,
    earring: appearance.earring,
    shirt: appearance.shirt,
    shirtTone: appearance.shirtTone,
  };
}

/** Humor (-5..5) normalizado para a expressão do rosto (-1..1). */
export function moodOf(subject: PortraitSubject): number {
  return Math.max(-1, Math.min(1, (subject.happiness || 0) / 5));
}
