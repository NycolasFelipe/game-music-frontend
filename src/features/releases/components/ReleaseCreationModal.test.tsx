import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BandDetail, BandMember, Skills } from "@/features/bands";
import { ReleaseCreationModal } from "@/features/releases/components/ReleaseCreationModal";
import * as api from "@/features/releases/services/releases.api";
import * as bandsApi from "@/features/bands/services/bands.api";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/releases/services/releases.api", () => ({
  getReleaseFormats: vi.fn(),
  getBudgetTiers: vi.fn(),
  getQualityTiers: vi.fn(),
  getGenreProfiles: vi.fn(),
  generateReleaseTitle: vi.fn(),
  generateReleaseConcept: vi.fn(),
  startRelease: vi.fn(),
  getRelease: vi.fn(),
  resolveCreationEvent: vi.fn(),
  finalizeRelease: vi.fn(),
  cancelRelease: vi.fn(),
}));

vi.mock("@/features/bands/services/bands.api", () => ({
  getBandOptions: vi.fn(),
}));

const skills = (partial: Partial<Skills>): Skills => ({
  vocal: 0,
  guitar: 0,
  bass: 0,
  drums: 0,
  piano: 0,
  lyrics: 0,
  ...partial,
});

const member = (id: string, name: string, partial: Partial<Skills>) =>
  ({
    id,
    name,
    avatar: "🧑",
    skills: skills(partial),
    happiness: 0,
  }) as BandMember;

const band = {
  id: "b-1",
  name: "Os Rebeldes",
  theme: "grunge",
  balance: 10_000,
  members: [
    member("m1", "Ana", { guitar: 8 }),
    member("m2", "Beto", { vocal: 5 }),
  ],
  relationships: [],
} as unknown as BandDetail;

describe("ReleaseCreationModal", () => {
  beforeEach(() => {
    vi.mocked(bandsApi.getBandOptions).mockResolvedValue({
      themes: [{ id: "grunge", label: "Grunge" }],
      origins: [],
      foundationYears: [],
    });
    vi.mocked(api.getReleaseFormats).mockResolvedValue([
      {
        id: "single",
        label: "Single",
        minTracks: 1,
        maxTracks: 2,
        baseCost: 800,
        baseReach: 400,
        baseRevenue: 1200,
        skillGain: 0.6,
      },
      {
        id: "album",
        label: "Álbum",
        minTracks: 10,
        maxTracks: 14,
        baseCost: 6000,
        baseReach: 4000,
        baseRevenue: 12000,
        skillGain: 1.4,
      },
    ]);
    vi.mocked(api.getBudgetTiers).mockResolvedValue([
      {
        id: "estudio",
        label: "Estúdio",
        description: "Um estúdio de verdade.",
        costMultiplier: 1,
        qualityMultiplier: 1,
      },
    ]);
    vi.mocked(api.getQualityTiers).mockResolvedValue([
      {
        id: "fracasso",
        label: "Fracasso",
        emoji: "💥",
        minQuality: 0,
        fansMultiplier: 0.3,
        revenueMultiplier: 0.3,
      },
    ]);
    vi.mocked(api.getGenreProfiles).mockResolvedValue([
      {
        style: "grunge",
        label: "Grunge",
        weights: {
          guitar: 0.28,
          drums: 0.22,
          vocal: 0.22,
          bass: 0.12,
          lyrics: 0.12,
          piano: 0.04,
        },
      },
    ]);
  });

  it("walks the player from concept to the studio, gated by a title", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReleaseCreationModal band={band} onClose={vi.fn()} />);

    // Step 1: the style profile tells the player what the genre demands.
    expect(await screen.findByText("O que este estilo cobra:")).toBeVisible();
    const next = screen.getByRole("button", { name: "Produção →" });
    expect(next).toBeDisabled();

    await user.type(screen.getByLabelText("Título"), "Ruído Branco");
    await user.click(next);

    // Step 2: formats and budgets are cards with their stats.
    expect(await screen.findByText("Álbum")).toBeVisible();
    expect(screen.getByText("10–14 faixas")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Créditos →" }));

    // Step 3: the credits stage, ordered by what the style weighs — guitar
    // leads in grunge, carrying 28% of the score.
    expect(await screen.findByText("Escalação")).toBeVisible();
    expect(screen.getByText(/28% da nota/)).toBeVisible();
  });

  it("puts a musician in hand and drops them on an instrument", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReleaseCreationModal band={band} onClose={vi.fn()} />);

    await user.type(await screen.findByLabelText("Título"), "Ruído Branco");
    await user.click(screen.getByRole("button", { name: "Produção →" }));
    await user.click(await screen.findByRole("button", { name: "Créditos →" }));

    // Pick Ana up: every instrument then offers what she is worth there.
    await user.click(await screen.findByRole("button", { name: "Selecionar Ana" }));
    expect(
      screen.getByRole("button", { name: "Creditar Ana em Guitarra" }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Creditar Ana em Guitarra" }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Remover Ana de Guitarra" }),
      ).toBeVisible(),
    );
  });

  it("stacks several musicians on the same instrument", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReleaseCreationModal band={band} onClose={vi.fn()} />);

    await user.type(await screen.findByLabelText("Título"), "Ruído Branco");
    await user.click(screen.getByRole("button", { name: "Produção →" }));
    await user.click(await screen.findByRole("button", { name: "Créditos →" }));

    // First player, in hand.
    await user.click(
      await screen.findByRole("button", { name: "Selecionar Ana" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Creditar Ana em Guitarra" }),
    );

    // Second player on the same instrument, from the instrument's own shortcut.
    await user.click(screen.getByRole("button", { name: "Selecionar Ana" }));
    await user.click(
      await screen.findByRole("button", {
        name: "Escolher quem assina Guitarra",
      }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Creditar Beto em Guitarra" }),
    );

    // Both stay credited on guitar.
    expect(
      await screen.findByRole("button", { name: "Remover Ana de Guitarra" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Remover Beto de Guitarra" }),
    ).toBeVisible();
  });

  it("also fills an instrument from the instrument itself, ranked by skill", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReleaseCreationModal band={band} onClose={vi.fn()} />);

    await user.type(await screen.findByLabelText("Título"), "Ruído Branco");
    await user.click(screen.getByRole("button", { name: "Produção →" }));
    await user.click(await screen.findByRole("button", { name: "Créditos →" }));

    await user.click(
      await screen.findByRole("button", {
        name: "Escolher quem assina Vocal",
      }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Creditar Beto em Vocal" }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Remover Beto de Vocal" }),
      ).toBeVisible(),
    );
  });
});
