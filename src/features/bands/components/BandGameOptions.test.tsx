import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BandGameOptions } from "@/features/bands/components/BandGameOptions";
import * as api from "@/features/bands/services/bands.api";
import type { BandDetail } from "@/features/bands/types";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/bands/services/bands.api", () => ({
  updateBandSettings: vi.fn(),
}));

const band = (autoSalaryAdjust: boolean): BandDetail => ({
  id: "b-1",
  name: "Os Rebeldes",
  theme: "grunge",
  origin: "seattle",
  foundationYear: 1990,
  fanCount: 100,
  fame: {
    level: 1,
    title: "Garagem",
    subtitle: "",
    isMaxLevel: false,
    currentLevelMinFans: 0,
    currentLevelMaxFans: 500,
    nextLevelAtFans: 500,
  },
  currentYear: 1991,
  balance: 5000,
  autoSalaryAdjust,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  members: [],
  relationships: [],
});

describe("BandGameOptions", () => {
  beforeEach(() => {
    vi.mocked(api.updateBandSettings).mockResolvedValue(band(true));
  });

  it("reflects the save's current option", () => {
    renderWithProviders(<BandGameOptions band={band(true)} />);

    expect(screen.getByRole("switch")).toBeChecked();
    expect(
      screen.getByText("Ajustar salários automaticamente"),
    ).toBeInTheDocument();
  });

  it("saves the option when toggled on", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BandGameOptions band={band(false)} />);

    await user.click(screen.getByRole("switch"));

    await waitFor(() =>
      expect(api.updateBandSettings).toHaveBeenCalledWith("b-1", {
        autoSalaryAdjust: true,
      }),
    );
  });
});
