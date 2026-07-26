import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as bandsApi from "@/features/bands/services/bands.api";
import type { BandDetail } from "@/features/bands";
import { DecisionsModal } from "@/features/decisions/components/DecisionsModal";
import { useDecisionsUi } from "@/features/decisions/store/decisions.store";
import * as eventsApi from "@/features/events/services/events.api";
import type { ActiveEvent } from "@/features/events";
import * as releasesApi from "@/features/releases/services/releases.api";
import type { CreationEvent, Release } from "@/features/releases";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/events/services/events.api", () => ({
  listActiveEvents: vi.fn(),
  listPassiveEvents: vi.fn(),
  resolveActiveEvent: vi.fn(),
}));

vi.mock("@/features/releases/services/releases.api", () => ({
  listReleases: vi.fn(),
  getRelease: vi.fn(),
  getReleaseFormats: vi.fn(),
  resolveCreationEvent: vi.fn(),
  finalizeRelease: vi.fn(),
}));

vi.mock("@/features/bands/services/bands.api", () => ({
  listCharacteristics: vi.fn(),
}));

const band = {
  id: "b-1",
  name: "Os Rebeldes",
  members: [{ id: "m1", name: "Ana", avatar: "🧑" }],
  relationships: [],
} as unknown as BandDetail;

const bandEvent: ActiveEvent = {
  id: "e-1",
  bandId: "b-1",
  templateId: "t-1",
  year: 1991.5,
  type: "convite",
  title: "Convite para abrir um show",
  description: "Uma banda maior chamou vocês para abrir a noite.",
  involvedCharacterIds: ["m1"],
  options: [
    { id: "aceitar", label: "Aceitar", description: "Palco é palco." },
    { id: "recusar", label: "Recusar", description: "Não vale o desgaste." },
  ],
  resolved: false,
  chosenOptionId: null,
  outcome: null,
};

const session: CreationEvent = {
  id: "s-1",
  sequence: 1,
  kind: "conflito_visao",
  prompt: "O baterista quer refazer tudo mais rápido.",
  options: [
    { id: "ceder", label: "Ceder", description: "Deixa ele conduzir." },
    { id: "manter", label: "Manter", description: "O arranjo fica." },
  ],
  resolved: false,
  chosenOptionId: null,
  qualityModifier: null,
};

const draft = {
  id: "r-1",
  bandId: "b-1",
  title: "Ruído Branco",
  format: "ep",
  status: "em_criacao",
  productionTurnsLeft: 2,
  creationEvents: [session],
} as unknown as Release & { creationEvents: CreationEvent[] };

describe("DecisionsModal", () => {
  beforeEach(() => {
    useDecisionsUi.setState({ open: false });
    vi.mocked(bandsApi.listCharacteristics).mockResolvedValue([]);
    vi.mocked(eventsApi.listActiveEvents).mockResolvedValue([]);
    vi.mocked(releasesApi.listReleases).mockResolvedValue([]);
    vi.mocked(releasesApi.getReleaseFormats).mockResolvedValue([
      {
        id: "ep",
        label: "EP",
        minTracks: 3,
        maxTracks: 5,
        baseCost: 2000,
        baseReach: 1000,
        baseRevenue: 3000,
        skillGain: 0.9,
        productionTurns: 2,
      },
    ]);
    vi.mocked(releasesApi.resolveCreationEvent).mockResolvedValue(draft);
    vi.mocked(eventsApi.resolveActiveEvent).mockResolvedValue({
      event: { ...bandEvent, resolved: true, chosenOptionId: "aceitar" },
      outcome: { description: "A casa lotou." },
      fameChange: {
        previousLevel: 1,
        newLevel: 1,
        leveledUp: false,
        gainedLevels: 0,
        milestones: [],
      },
    });
  });

  it("opens by itself when the band owes a decision", async () => {
    const user = userEvent.setup();
    vi.mocked(eventsApi.listActiveEvents).mockResolvedValue([bandEvent]);

    renderWithProviders(<DecisionsModal band={band} />);

    // No click needed: the decision comes to the player.
    expect(
      await screen.findByText("Convite para abrir um show"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Aceitar/ }));

    await waitFor(() =>
      expect(eventsApi.resolveActiveEvent).toHaveBeenCalledWith(
        "b-1",
        "e-1",
        "aceitar",
      ),
    );
  });

  it("brings a studio session to the player without opening the discography", async () => {
    const user = userEvent.setup();
    vi.mocked(releasesApi.listReleases).mockResolvedValue([draft]);
    vi.mocked(releasesApi.getRelease).mockResolvedValue(draft);

    renderWithProviders(<DecisionsModal band={band} />);

    expect(
      await screen.findByText(/O baterista quer refazer tudo mais rápido/),
    ).toBeInTheDocument();
    // The format says how many sessions the record will have, not how many
    // have been drawn so far.
    expect(screen.getByText("Sessão 1 de 2")).toBeInTheDocument();

    await user.click(screen.getByText("Ceder"));

    await waitFor(() =>
      expect(releasesApi.resolveCreationEvent).toHaveBeenCalledWith(
        "b-1",
        "r-1",
        "s-1",
        "ceder",
      ),
    );
  });

  it("queues both kinds and answers the band's own events first", async () => {
    vi.mocked(eventsApi.listActiveEvents).mockResolvedValue([bandEvent]);
    vi.mocked(releasesApi.listReleases).mockResolvedValue([draft]);
    vi.mocked(releasesApi.getRelease).mockResolvedValue(draft);

    renderWithProviders(<DecisionsModal band={band} />);

    expect(await screen.findByText("1 de 2")).toBeInTheDocument();
    expect(screen.getByText("Convite para abrir um show")).toBeInTheDocument();
  });

  it("offers the launch when the work comes out of the studio", async () => {
    const user = userEvent.setup();
    const ready = {
      ...draft,
      productionTurnsLeft: 0,
      creationEvents: [{ ...session, resolved: true, chosenOptionId: "ceder" }],
    };
    vi.mocked(releasesApi.listReleases).mockResolvedValue([ready]);
    vi.mocked(releasesApi.getRelease).mockResolvedValue(ready);
    vi.mocked(releasesApi.finalizeRelease).mockResolvedValue(ready);

    renderWithProviders(<DecisionsModal band={band} />);

    expect(await screen.findByText(/está pronta/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Lançar EP/ }));

    await waitFor(() =>
      expect(releasesApi.finalizeRelease).toHaveBeenCalledWith("b-1", "r-1"),
    );
  });

  it("stays out of the way when nothing is pending", async () => {
    renderWithProviders(<DecisionsModal band={band} />);

    await waitFor(() =>
      expect(releasesApi.listReleases).toHaveBeenCalledWith("b-1"),
    );
    expect(screen.queryByText("A banda precisa de você")).toBeNull();
  });
});
