import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActivitiesPanel } from "@/features/activities/components/ActivitiesPanel";
import * as api from "@/features/activities/services/activities.api";
import type { ActivityOptions } from "@/features/activities/types";
import type { BandDetail } from "@/features/bands";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/activities/services/activities.api", () => ({
  getActivityOptions: vi.fn(),
  listBandActivities: vi.fn(),
  holdActivity: vi.fn(),
}));

const options = (heldThisTurn = 0): ActivityOptions => ({
  heldThisTurn,
  nextSaturation: heldThisTurn === 0 ? 1 : 0.5,
  hostilityRisk: 0.06,
  troubleChanceMax: 0.8,
  activities: [
    {
      id: "jantar",
      label: "Jantar da banda",
      description: "Uma mesa e nenhuma pauta.",
      emoji: "🍽️",
      minParticipants: 2,
      maxParticipants: 6,
      happinessGain: 0.4,
      relationshipGain: 1,
      troubleChance: 0.05,
      costs: [
        { participants: 2, cost: 240 },
        { participants: 3, cost: 300 },
      ],
    },
  ],
});

const band = (balance = 5000): BandDetail =>
  ({
    id: "b-1",
    name: "Os Rebeldes",
    balance,
    members: [
      { id: "m1", name: "Ana", avatar: "🧑" },
      { id: "m2", name: "Beto", avatar: "🧔" },
    ],
    relationships: [{ memberAId: "m1", memberBId: "m2", level: -5 }],
  }) as unknown as BandDetail;

describe("ActivitiesPanel", () => {
  beforeEach(() => {
    vi.mocked(api.getActivityOptions).mockResolvedValue(options());
    vi.mocked(api.listBandActivities).mockResolvedValue([]);
    vi.mocked(api.holdActivity).mockResolvedValue({
      activity: {
        id: "a-1",
        bandId: "b-1",
        activityId: "jantar",
        heldAtYear: 1991.5,
        cost: 240,
        participantIds: ["m1", "m2"],
        happinessDelta: 0.4,
        relationshipDelta: 1,
        trouble: false,
        troubleEventId: null,
        createdAt: "2026-01-01T00:00:00Z",
      },
      balance: 4760,
      saturation: 1,
      troubleChance: 0.35,
      trouble: false,
      participants: [],
      relationshipChanges: [],
      troubleEvent: null,
    });
  });

  it("will not book anything until the guest list is big enough", async () => {
    renderWithProviders(<ActivitiesPanel band={band()} />);

    expect(await screen.findByText("Jantar da banda")).toBeVisible();
    expect(screen.getByRole("button", { name: /Leve 2–6/ })).toBeDisabled();
  });

  it("prices the activity for the chosen guest list and books it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);

    await user.click(await screen.findByRole("checkbox", { name: "Levar Ana" }));
    await user.click(screen.getByRole("checkbox", { name: "Levar Beto" }));

    // The price comes from the server's table for this head count.
    await user.click(await screen.findByRole("button", { name: /Marcar · 240/ }));

    await waitFor(() =>
      expect(api.holdActivity).toHaveBeenCalledWith("b-1", "jantar", [
        "m1",
        "m2",
      ]),
    );
  });

  it("warns that the guest list is a powder keg", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);

    await user.click(await screen.findByRole("checkbox", { name: "Levar Ana" }));
    await user.click(screen.getByRole("checkbox", { name: "Levar Beto" }));

    expect(screen.getByText(/não se suporta/)).toBeVisible();
    // 0.05 + 5 * 0.06 = 0.35 — a dinner turns risky because of who was invited.
    expect(screen.getByText("🟡 risco médio")).toBeVisible();
  });

  it("says the repeated activity of the turn is worth less", async () => {
    vi.mocked(api.getActivityOptions).mockResolvedValue(options(1));

    renderWithProviders(<ActivitiesPanel band={band()} />);

    expect(await screen.findByText(/já se reuniu/)).toBeVisible();
    expect(screen.getByText("50%")).toBeVisible();
  });

  it("blocks what the cash cannot cover", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band(10)} />);

    await user.click(await screen.findByRole("checkbox", { name: "Levar Ana" }));
    await user.click(screen.getByRole("checkbox", { name: "Levar Beto" }));

    expect(
      screen.getByRole("button", { name: "Caixa insuficiente" }),
    ).toBeDisabled();
  });
});
