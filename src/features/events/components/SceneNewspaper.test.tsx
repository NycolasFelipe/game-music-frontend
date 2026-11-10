import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SceneNewspaper } from "@/features/events/components/SceneNewspaper";
import * as api from "@/features/events/services/events.api";
import type { PassiveEvent } from "@/features/events/types";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/events/services/events.api", () => ({
  listActiveEvents: vi.fn(),
  listPassiveEvents: vi.fn(),
  resolveActiveEvent: vi.fn(),
}));

/** A passive event with sensible defaults. */
function news(partial: Partial<PassiveEvent>): PassiveEvent {
  return {
    id: partial.id ?? "n",
    bandId: "b-1",
    templateId: "t",
    year: 1980,
    type: "colaboracao_musical",
    description: "",
    artists: [],
    ...partial,
  };
}

describe("SceneNewspaper", () => {
  it("leads with the newest scene news, bolds the artists and leaves departures out", async () => {
    vi.mocked(api.listPassiveEvents).mockResolvedValue([
      news({ id: "old", year: 1980, description: "Rita Lee lança disco novo.", artists: ["Rita Lee"], type: "lancamento_album" }),
      news({ id: "new", year: 1981.5, description: "Elis Regina sai em turnê.", artists: ["Elis Regina"], type: "turne_conjunta" }),
      news({ id: "dep", year: 1981.5, description: "Ana deixou a banda.", artists: ["Ana"], type: "saida_integrante" }),
    ]);

    renderWithProviders(<SceneNewspaper bandId="b-1" currentYear={1981.5} />);

    expect(await screen.findByText("Gazeta do Groove")).toBeVisible();
    expect(screen.getByText("Última hora")).toBeVisible();
    const articles = screen.getAllByRole("article");
    expect(articles[0]).toHaveTextContent("Elis Regina sai em turnê.");
    expect(articles[1]).toHaveTextContent("Rita Lee lança disco novo.");
    expect(screen.getByText("Rita Lee").tagName).toBe("B");
    expect(screen.queryByText(/Ana deixou a banda/)).toBeNull();
  });

  it("prints nothing before the first news", async () => {
    vi.mocked(api.listPassiveEvents).mockResolvedValue([]);
    renderWithProviders(<SceneNewspaper bandId="b-1" currentYear={1980} />);
    await vi.waitFor(() => expect(api.listPassiveEvents).toHaveBeenCalled());
    expect(screen.queryByText("Gazeta do Groove")).toBeNull();
  });
});
