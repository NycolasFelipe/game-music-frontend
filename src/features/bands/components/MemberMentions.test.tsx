import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MemberCardData } from "@/features/bands/components/MemberCard";
import { MemberMentions } from "@/features/bands/components/MemberMentions";
import { renderWithProviders } from "@/test/render";

const member = (id: string, name: string): MemberCardData => ({
  id,
  name,
  age: 22,
  gender: "female",
  avatar: "",
  primarySkill: "guitar",
  skills: { vocal: 1, guitar: 3, bass: 0, drums: 0, piano: 0, lyrics: 1 },
  characteristics: [],
  biography: "",
});

describe("MemberMentions", () => {
  it("turns each member name in the text into a hover mention", () => {
    const { container } = renderWithProviders(
      <p data-testid="text">
        <MemberMentions
          text="Ana Luz e Bia brigam. Ana Luz tem certeza."
          members={[member("m1", "Ana Luz"), member("m2", "Bia")]}
          catalog={new Map()}
        />
      </p>,
    );
    const mentions = [...container.querySelectorAll(".rv-mention")].map((el) => el.textContent);
    expect(mentions).toEqual(["Ana Luz", "Bia", "Ana Luz"]);
    expect(screen.getByTestId("text").textContent).toBe("Ana Luz e Bia brigam. Ana Luz tem certeza.");
  });

  it("prefers the longest name when one name contains another", () => {
    const { container } = renderWithProviders(
      <MemberMentions
        text="Ana Luz chegou."
        members={[member("m1", "Ana"), member("m2", "Ana Luz")]}
        catalog={new Map()}
      />,
    );
    const mentions = [...container.querySelectorAll(".rv-mention")].map((el) => el.textContent);
    expect(mentions).toEqual(["Ana Luz"]);
  });

  it("mentions a unique first name and keeps it as written", () => {
    const { container } = renderWithProviders(
      <p data-testid="text">
        <MemberMentions
          text="Dênis sente o golpe. Ana e Ana Luz não."
          members={[member("m1", "Dênis Albuquerque"), member("m2", "Ana Luz"), member("m3", "Ana Bia")]}
          catalog={new Map()}
        />
      </p>,
    );
    const mentions = [...container.querySelectorAll(".rv-mention")].map((el) => el.textContent);
    // "Ana" is shared by two members, so only the full name is a mention.
    expect(mentions).toEqual(["Dênis", "Ana Luz"]);
    expect(screen.getByTestId("text").textContent).toBe("Dênis sente o golpe. Ana e Ana Luz não.");
  });

  it("leaves the text alone when no member is named", () => {
    const { container } = renderWithProviders(
      <p data-testid="text">
        <MemberMentions text="O técnico pediu demissão." members={[member("m1", "Ana")]} catalog={new Map()} />
      </p>,
    );
    expect(container.querySelectorAll(".rv-mention")).toHaveLength(0);
    expect(screen.getByTestId("text").textContent).toBe("O técnico pediu demissão.");
  });
});
