import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HALFTONE_PAPER } from "@/components/halftone";
import { Figure } from "@/features/bands/portrait/Figure";
import type { PortraitSubject } from "@/features/bands/portrait/looks";

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
});
