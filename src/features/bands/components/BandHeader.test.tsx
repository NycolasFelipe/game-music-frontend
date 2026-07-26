import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BandHeader } from "@/features/bands/components/BandHeader";
import type { BandDetail } from "@/features/bands/types";
import { renderWithProviders } from "@/test/render";

const band = (overrides: Partial<BandDetail> = {}): BandDetail =>
  ({
    id: "b-1",
    name: "Os Rebeldes",
    foundationYear: 1989,
    currentYear: 1991.5,
    fanCount: 700,
    balance: 8320,
    fame: {
      level: 4,
      title: "Revelações",
      subtitle: "Agenda cheia em bares da cidade",
      isMaxLevel: false,
      currentLevelMinFans: 601,
      currentLevelMaxFans: 1000,
      nextLevelAtFans: 1001,
    },
    members: [],
    relationships: [],
    ...overrides,
  }) as unknown as BandDetail;

describe("BandHeader", () => {
  it("shows who the band is and what it has", () => {
    renderWithProviders(
      <BandHeader band={band()} themeLabel="Grunge" originLabel="São Paulo" />,
    );

    expect(screen.getByText("Os Rebeldes")).toBeVisible();
    expect(screen.getByText("Grunge")).toBeVisible();
    expect(screen.getByText("desde 1989")).toBeVisible();
    expect(screen.getByText("700")).toBeVisible();
    expect(screen.getByText("8.320")).toBeVisible();
  });

  it("names the fame level and how far the next one is", () => {
    renderWithProviders(
      <BandHeader band={band()} themeLabel="Grunge" originLabel="São Paulo" />,
    );

    expect(screen.getByText("Nível 4 · Revelações")).toBeVisible();
    expect(screen.getByText("Agenda cheia em bares da cidade")).toBeVisible();
    expect(screen.getByText(/faltam 301 fãs para o Nível 5/)).toBeVisible();
  });

  it("has nothing left to climb at the top", () => {
    const maxed = band({
      fanCount: 2_000_000_000,
      fame: {
        level: 30,
        title: "Deuses da Música",
        subtitle: "Status de lenda inquestionável",
        isMaxLevel: true,
        currentLevelMinFans: 1_200_000_001,
        currentLevelMaxFans: null,
        nextLevelAtFans: null,
      },
    });

    renderWithProviders(
      <BandHeader band={maxed} themeLabel="Grunge" originLabel="São Paulo" />,
    );

    expect(screen.getByText("No topo da escada")).toBeVisible();
  });
});
