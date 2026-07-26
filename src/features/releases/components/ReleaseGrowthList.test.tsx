import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReleaseGrowthList } from "@/features/releases/components/ReleaseGrowthList";
import { renderWithProviders } from "@/test/render";

/** The rendered nodes, ignoring the `<style>` tags Mantine injects. */
function rendered(container: HTMLElement): Element[] {
  return Array.from(container.children).filter((el) => el.tagName !== "STYLE");
}

describe("ReleaseGrowthList", () => {
  it("shows what each credited member developed, with the level-up marker", () => {
    renderWithProviders(
      <ReleaseGrowthList
        growth={[
          {
            memberId: "m1",
            name: "Ana",
            happinessDelta: 0.5,
            gains: [
              { skill: "lyrics", from: 4.2, to: 4.6, leveledUp: false },
              { skill: "vocal", from: 3.9, to: 4.3, leveledUp: true },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Letras 4.2 → 4.6")).toBeInTheDocument();
    expect(screen.getByText("Vocal 3.9 → 4.3 · nível 4!")).toBeInTheDocument();
    expect(screen.getByText("+0,5 humor")).toBeInTheDocument();
  });

  it("renders nothing for a work launched before the feature", () => {
    const { container } = renderWithProviders(
      <ReleaseGrowthList growth={undefined} />,
    );
    expect(rendered(container)).toHaveLength(0);
  });

  it("skips members who neither grew nor felt anything", () => {
    const { container } = renderWithProviders(
      <ReleaseGrowthList
        growth={[
          { memberId: "m1", name: "Ana", happinessDelta: 0, gains: [] },
        ]}
      />,
    );
    expect(rendered(container)).toHaveLength(0);
  });
});
