import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as bandsApi from "@/features/bands/services/bands.api";
import type { BandDetail } from "@/features/bands";
import { DiscographyTab } from "@/features/releases/components/DiscographyTab";
import * as api from "@/features/releases/services/releases.api";
import { useReleaseRevealUi } from "@/features/releases/store/release-reveal.store";
import type { Release } from "@/features/releases/types";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/releases/services/releases.api", () => ({
  listReleases: vi.fn(),
  cancelRelease: vi.fn(),
  getReleaseFormats: vi.fn(),
  getQualityTiers: vi.fn(),
  getReviewTiers: vi.fn(),
}));

vi.mock("@/features/bands/services/bands.api", () => ({
  listCharacteristics: vi.fn(),
}));

const band = {
  id: "b-1",
  name: "Os Rebeldes",
  members: [],
  relationships: [],
} as unknown as BandDetail;

const launched = {
  id: "r-1",
  bandId: "b-1",
  title: "Ruído Branco",
  format: "ep",
  status: "lancada",
  quality: 78,
  qualityTier: "otima",
  criticTier: "otima",
  publicTier: "otima",
  productionTurnsLeft: 0,
  creationLog: [],
} as unknown as Release;

describe("DiscographyTab", () => {
  beforeEach(() => {
    useReleaseRevealUi.setState({ release: null });
    vi.mocked(bandsApi.listCharacteristics).mockResolvedValue([]);
    vi.mocked(api.listReleases).mockResolvedValue([launched]);
    vi.mocked(api.getReleaseFormats).mockResolvedValue([]);
    vi.mocked(api.getQualityTiers).mockResolvedValue([]);
    vi.mocked(api.getReviewTiers).mockResolvedValue([]);
  });

  it("shelves a launched work", async () => {
    renderWithProviders(<DiscographyTab band={band} />);

    expect(await screen.findByText("Ruído Branco")).toBeInTheDocument();
  });

  it("keeps the work off the shelf while its reception is being revealed", async () => {
    useReleaseRevealUi.setState({ release: launched });

    renderWithProviders(<DiscographyTab band={band} />);

    await waitFor(() => expect(api.listReleases).toHaveBeenCalledWith("b-1"));
    // Printing its stars behind the reveal would give the score away first.
    expect(screen.queryByText("Ruído Branco")).toBeNull();
    expect(screen.getByText("Nenhuma obra lançada ainda.")).toBeInTheDocument();
  });
});
