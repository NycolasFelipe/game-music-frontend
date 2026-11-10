import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActivitiesPanel } from "@/features/activities/components/ActivitiesPanel";
import * as api from "@/features/activities/services/activities.api";
import type { ActivityOptions } from "@/features/activities/types";
import type { BandDetail } from "@/features/bands";
import * as eventsApi from "@/features/events/services/events.api";
import * as prefsApi from "@/features/preferences/services/preferences.api";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/activities/services/activities.api", () => ({
  getActivityOptions: vi.fn(),
  listBandActivities: vi.fn(),
  holdActivity: vi.fn(),
}));

vi.mock("@/features/events/services/events.api", () => ({
  listActiveEvents: vi.fn(),
  listPassiveEvents: vi.fn(),
  resolveActiveEvent: vi.fn(),
}));

vi.mock("@/features/bands/services/bands.api", () => ({
  listCharacteristics: vi.fn().mockResolvedValue([]),
  getBandOptions: vi.fn(),
}));

vi.mock("@/features/preferences/services/preferences.api", () => ({
  getUserPreferences: vi.fn(),
  updateUserPreferences: vi.fn(),
}));

const options = (heldThisTurn = 0): ActivityOptions => ({
  heldThisTurn,
  nextSaturation: heldThisTurn === 0 ? 1 : 0.5,
  hostilityRisk: 0.06,
  troubleChanceMax: 0.8,
  relationshipCap: 3,
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

/** Opens the Convívio insert, where the guest list and the activity live. */
async function openInsert(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Marcar convívio" }));
}

describe("ActivitiesPanel", () => {
  beforeEach(() => {
    vi.mocked(prefsApi.getUserPreferences).mockResolvedValue({
      peopleView: "cards",
    });
    vi.mocked(prefsApi.updateUserPreferences).mockImplementation((patch) =>
      Promise.resolve({ peopleView: "cards", ...patch }),
    );
    vi.mocked(eventsApi.listActiveEvents).mockResolvedValue([]);
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
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);
    await openInsert(user);

    expect(await screen.findByText("Jantar da banda")).toBeVisible();
    expect(screen.getByRole("button", { name: /Leve 2–6/ })).toBeDisabled();
  });

  it("prices the activity for the chosen guest list and books it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);
    await openInsert(user);

    await user.click(await screen.findByRole("checkbox", { name: "Levar Ana" }));
    await user.click(screen.getByRole("checkbox", { name: "Levar Beto" }));

    // The price comes from the server's table for this head count.
    await user.click(await screen.findByRole("button", { name: /Marcar · \$240/ }));

    await waitFor(() =>
      expect(api.holdActivity).toHaveBeenCalledWith("b-1", "jantar", [
        "m1",
        "m2",
      ]),
    );

    // The result replaces the choice inside the same insert.
    expect(await screen.findByText("Jantar da banda sem vítimas")).toBeVisible();
    expect(screen.getByText("Custo")).toBeVisible();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeVisible();
  });

  it("warns that the guest list is a powder keg", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);
    await openInsert(user);

    await user.click(await screen.findByRole("checkbox", { name: "Levar Ana" }));
    await user.click(screen.getByRole("checkbox", { name: "Levar Beto" }));

    expect(screen.getByText(/não se suporta/)).toBeVisible();
    // 0.05 + 5 * 0.06 = 0.35 — a dinner turns risky because of who was invited.
    expect(screen.getByText("risco médio")).toBeVisible();
  });

  it("says how far a night out can take a relationship (ADR-0029)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);
    await openInsert(user);
    await user.click(await screen.findByRole("checkbox", { name: "Levar Ana" }));
    await user.click(screen.getByRole("checkbox", { name: "Levar Beto" }));

    expect(screen.getByText(/relação \+1\s*\(até \+3\)/)).toBeVisible();
  });

  it("takes the whole band, or nobody, with one click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);
    await openInsert(user);

    await user.click(await screen.findByRole("button", { name: "Todos" }));
    expect(screen.getByRole("checkbox", { name: "Tirar Ana" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Tirar Beto" })).toBeChecked();
    expect(screen.getByText("Quem vai (2)")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Ninguém" }));
    expect(screen.getByText("Quem vai (0)")).toBeVisible();
  });

  it("picks guests on the relationship circle too", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);
    await openInsert(user);

    await user.click(await screen.findByRole("radio", { name: "Grafo" }));

    // The choice is the account's, not this screen's (ADR-0018).
    await waitFor(() =>
      expect(prefsApi.updateUserPreferences).toHaveBeenCalledWith({
        peopleView: "graph",
      }),
    );

    // The same people answer to the same labels in either view.
    await user.click(await screen.findByRole("checkbox", { name: "Levar Ana" }));
    expect(
      screen.getByRole("checkbox", { name: "Tirar Ana" }),
    ).toBeInTheDocument();
  });

  it("opens on the view the account already chose", async () => {
    vi.mocked(prefsApi.getUserPreferences).mockResolvedValue({
      peopleView: "graph",
    });

    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band()} />);
    await openInsert(user);

    // No click on the toggle: the graph is how this player looks at people, in every save.
    expect(
      await screen.findByText(/acendem as relações que a saída vai mexer/),
    ).toBeInTheDocument();
  });

  it("blocks what the cash cannot cover", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ActivitiesPanel band={band(10)} />);
    await openInsert(user);

    await user.click(await screen.findByRole("checkbox", { name: "Levar Ana" }));
    await user.click(screen.getByRole("checkbox", { name: "Levar Beto" }));

    expect(
      screen.getByRole("button", { name: "Caixa insuficiente" }),
    ).toBeDisabled();
  });

  it("fills an empty table with an illustration before the first night out", async () => {
    renderWithProviders(<ActivitiesPanel band={band()} />);

    expect(await screen.findByRole("img", { name: /Mesa de bar vazia/ })).toBeInTheDocument();
  });

  it("lists the last nights out instead of the illustration", async () => {
    vi.mocked(api.listBandActivities).mockResolvedValue([
      {
        id: "a-0",
        bandId: "b-1",
        activityId: "jantar",
        heldAtYear: 1990.5,
        cost: 240,
        participantIds: ["m1", "m2"],
        happinessDelta: 0.4,
        relationshipDelta: 1,
        trouble: true,
        troubleEventId: "e-9",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ]);

    renderWithProviders(<ActivitiesPanel band={band()} />);

    expect(await screen.findByText("Últimas saídas")).toBeVisible();
    expect(await screen.findByText("Jantar da banda")).toBeVisible();
    expect(screen.getByText(/deu treta/)).toBeVisible();
    expect(screen.queryByRole("img", { name: /Mesa de bar vazia/ })).toBeNull();
  });

  it("opens a past night out in detail, with the trouble it caused", async () => {
    const user = userEvent.setup();
    vi.mocked(api.listBandActivities).mockResolvedValue([
      {
        id: "a-0",
        bandId: "b-1",
        activityId: "jantar",
        heldAtYear: 1990.5,
        cost: 240,
        participantIds: ["m1", "m2"],
        happinessDelta: 0.4,
        relationshipDelta: -1,
        trouble: true,
        troubleEventId: "e-9",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ]);
    vi.mocked(eventsApi.listActiveEvents).mockResolvedValue([
      {
        id: "e-9",
        bandId: "b-1",
        templateId: "c-1",
        year: 1990.5,
        type: "confraternizacao",
        title: "A conta",
        description: "Ana não vai dividir igual.",
        involvedCharacterIds: ["m1", "m2"],
        options: [{ id: "o-1", label: "Rachar e esquecer", description: "" }],
        resolved: true,
        chosenOptionId: "o-1",
        outcome: { description: "Beto pagou e anotou." },
      },
    ]);

    renderWithProviders(<ActivitiesPanel band={band()} />);
    await user.click(await screen.findByRole("button", { name: /Jantar da banda/ }));

    expect(await screen.findByText("Quem foi:")).toBeVisible();
    expect(screen.getByText("A conta")).toBeVisible();
    expect(screen.getByText("Sua escolha · Rachar e esquecer")).toBeVisible();
    expect(screen.getByText(/pagou e anotou/)).toBeVisible();
  });
});

