/**
 * Aparência de um integrante na foto (ADR-0023 do backend). Tom de pele e cor
 * do cabelo vêm do `avatar` emoji; o resto vem daqui. Compartilhado entre
 * integrantes, candidatos e ex-integrantes, por isso mora em `types/`.
 */
export type HairStyle =
  | "short"
  | "quiff"
  | "long"
  | "buzz"
  | "bald"
  | "curly"
  | "afro"
  | "bob"
  | "bun"
  | "curlylong";

export type BeardStyle = "none" | "stubble" | "full" | "goatee";

export type GlassesStyle = "none" | "round" | "sun";

export type ShirtStyle = "crew" | "v" | "jacket";

/** Escuridão da camisa na retícula (4 claro … 10 chapado). */
export type ShirtTone = 4 | 6 | 8 | 10;

/** Aparência guardada pelo backend para cada integrante. */
export interface MemberAppearance {
  hairStyle: HairStyle;
  beard: BeardStyle;
  glasses: GlassesStyle;
  earring: boolean;
  shirt: ShirtStyle;
  shirtTone: ShirtTone;
}

/** Cenário da foto de grupo da banda (ADR-0023 do backend). */
export type PhotoScene = "ensaio" | "palco" | "muro" | "estudio";
