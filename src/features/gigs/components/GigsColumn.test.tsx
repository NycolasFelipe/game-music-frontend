import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BandDetail } from "@/features/bands";
import { GigsColumn } from "@/features/gigs/components/GigsColumn";
import * as api from "@/features/gigs/services/gigs.api";
import type { Gig, GigPreview, GigType } from "@/features/gigs/types";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/gigs/services/gigs.api", () => ({
  getGigTypes: vi.fn(),
  listGigs: vi.fn(),
  playGig: vi.fn(),
}));

const bar: GigType = {
  id: "bar",
  label: "Bares e botecos",
  description: "Repertório próprio para quem veio beber.",
  minFameLevel: 0,
  baseFee: 450,
  cost: 60,
  baseFans: 40,
  wear: 0.1,
  ownFansMultiplier: 1,
};

const festival: GigType = {
  id: "festival",
  label: "Festivais",
  description: "Meia hora diante de milhares de pessoas.",
  minFameLevel: 12,
  baseFee: 15000,
  cost: 3500,
  baseFans: 6000,
  wear: 0.5,
  ownFansMultiplier: 1,
};

const band = (currentYear = 1991.5): BandDetail =>
  ({
    id: "b-1",
    name: "Os Rebeldes",
    balance: 5000,
    currentYear,
    fame: { level: 2 },
    members: [],
    relationships: [],
  }) as unknown as BandDetail;

const playedGig: Gig = {
  id: "gig-1",
  bandId: "b-1",
  gigTypeId: "bar",
  playedAtYear: 1991.5,
  fee: 500,
  cost: 60,
  net: 440,
  fansGained: 30,
  performance: 0.6,
  happinessDelta: -0.1,
  createdAt: "2026-01-01T00:00:00Z",
};

describe("GigsColumn", () => {
  beforeEach(() => {
    vi.mocked(api.getGigTypes).mockResolvedValue([bar, festival]);
    vi.mocked(api.listGigs).mockResolvedValue([]);
    vi.mocked(api.playGig).mockResolvedValue({
      gig: playedGig,
      balance: 5440,
      fanCount: 130,
      skillGains: [],
    });
  });

  it("locks the circuits the band's fame cannot reach", async () => {
    renderWithProviders(<GigsColumn band={band()} />);

    expect(await screen.findByText("Bares e botecos")).toBeVisible();
    expect(screen.getByRole("button", { name: /Precisa de fama 12/ })).toBeDisabled();
  });

  it("shows the expected outcome from the turn panel", async () => {
    const previews: GigPreview[] = [
      {
        gigTypeId: "bar",
        label: "Bares e botecos",
        minFameLevel: 0,
        available: true,
        expectedPerformance: 0.15,
        fee: 620,
        cost: 60,
        net: 560,
        fansGained: 19,
        happinessDelta: 0.33,
      },
    ];
    renderWithProviders(<GigsColumn band={band()} previews={previews} />);

    expect(await screen.findByText("$560")).toBeVisible();
    expect(screen.getByText(/\+19 fãs · humor \+0,33 · a casa espera 0,15/)).toBeVisible();
  });

  it("plays the chosen season", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GigsColumn band={band()} />);

    await screen.findByText("Bares e botecos");
    await user.click(screen.getByRole("button", { name: /Tocar a temporada/ }));

    await waitFor(() => expect(api.playGig).toHaveBeenCalledWith("b-1", "bar"));
  });

  it("blocks a second season in the same turn", async () => {
    vi.mocked(api.listGigs).mockResolvedValue([playedGig]);

    renderWithProviders(<GigsColumn band={band(1991.5)} />);

    expect(await screen.findByText(/já cumpriu a temporada deste turno/)).toBeVisible();
    expect(screen.queryByRole("button", { name: /Tocar a temporada/ })).toBeNull();
  });
});
