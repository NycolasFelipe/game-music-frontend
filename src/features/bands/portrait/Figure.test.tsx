import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HALFTONE_PAPER } from "@/components/halftone";
import { Figure } from "@/features/bands/portrait/Figure";
import { HAIR_VARIANTS, hairVariantOf, type PortraitSubject } from "@/features/bands/portrait/looks";
import type { HairStyle, ShirtStyle } from "@/types/appearance";

const subject = (avatar: string): PortraitSubject => ({
  id: "m-1",
  name: "Iara Lacerda",
  gender: "female",
  age: 30,
  avatar,
  happiness: 2,
  appearance: {
    hairStyle: "long",
    beard: "none",
    glasses: "none",
    earring: true,
    shirt: "jacket",
    shirtTone: 4,
  },
});

/** Sobrancelhas desenhadas em papel: o halo que vai por baixo do traço. */
function paperBrows(container: HTMLElement): Element[] {
  return [...container.querySelectorAll("path")].filter(
    (p) => p.getAttribute("stroke") === HALFTONE_PAPER && p.getAttribute("d")?.startsWith("M46,"),
  );
}

describe("Figure", () => {
  it("contorna os traços do rosto com papel em pele escura", () => {
    const { container } = render(
      <svg>
        <Figure subject={subject("👩🏿")} />
      </svg>,
    );
    expect(paperBrows(container)).toHaveLength(1);
  });

  it("mantém só o traço em tinta em pele clara", () => {
    const { container } = render(
      <svg>
        <Figure subject={subject("👩🏼")} />
      </svg>,
    );
    expect(paperBrows(container)).toHaveLength(0);
  });

  const SHIRTS: ShirtStyle[] = [
    "crew",
    "v",
    "jacket",
    "hoodie",
    "stripes",
    "turtleneck",
    "collar",
    "tank",
    "leather",
    "print",
  ];

  it("desenha cada corte de roupa de um jeito diferente", () => {
    const drawings = SHIRTS.map((shirt) => {
      const base = subject("👩🏽");
      const { container } = render(
        <svg>
          <Figure subject={{ ...base, appearance: { ...base.appearance!, shirt } }} />
        </svg>,
      );
      return [...container.querySelectorAll("path, rect, circle")]
        .map((el) => `${el.tagName}:${el.getAttribute("d") ?? ""}`)
        .join("|");
    });
    expect(new Set(drawings).size).toBe(SHIRTS.length);
  });

  it("desenha cada variação de cabelo de um jeito diferente", () => {
    const base = subject("👩🏽");
    const drawings = (Object.entries(HAIR_VARIANTS) as [HairStyle, readonly string[]][]).flatMap(([style, variants]) =>
      [...new Set(variants)].map((variant) => {
        let id = "";
        for (let n = 0; !id && n < 500; n++) {
          if (hairVariantOf({ ...base, id: `h-${n}` }, style) === variant) id = `h-${n}`;
        }
        const { container } = render(
          <svg>
            <Figure subject={{ ...base, id, appearance: { ...base.appearance!, hairStyle: style, earring: false } }} />
          </svg>,
        );
        return [...container.querySelectorAll("path, rect, circle, ellipse")]
          .map((el) => `${el.tagName}:${el.getAttribute("d") ?? el.getAttribute("cy") ?? ""}`)
          .join("|");
      }),
    );
    // "curly" aparece como variação de dois estilos base e desenha igual nos dois.
    expect(new Set(drawings).size).toBe(drawings.length - 1);
  });
});
