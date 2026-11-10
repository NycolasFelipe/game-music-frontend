import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StyleProfile } from "@/features/releases/components/StyleProfile";
import { aspectList, keyAspects } from "@/features/releases/style-aspects";
import * as api from "@/features/releases/services/releases.api";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/releases/services/releases.api", () => ({
  getGenreProfiles: vi.fn(),
}));

const rap = { lyrics: 0.34, vocal: 0.26, drums: 0.2, bass: 0.12, piano: 0.05, guitar: 0.03 };

describe("keyAspects", () => {
  it("names the three heaviest aspects, heaviest first", () => {
    expect(keyAspects(rap)).toEqual(["lyrics", "vocal", "drums"]);
  });

  it("breaks ties by the usual skill order", () => {
    const grunge = { guitar: 0.28, drums: 0.22, vocal: 0.22, bass: 0.12, lyrics: 0.12, piano: 0.04 };
    expect(keyAspects(grunge)).toEqual(["guitar", "vocal", "drums"]);
  });
});

describe("aspectList", () => {
  it("joins the names as a Portuguese list, in lowercase", () => {
    expect(aspectList(["lyrics", "vocal", "drums"])).toBe("letras, vocal e bateria");
    expect(aspectList(["piano"])).toBe("piano");
  });
});

describe("StyleProfile", () => {
  it("shows the pitch, the instruments in words and the footnote, with no percentages", async () => {
    vi.mocked(api.getGenreProfiles).mockResolvedValue([
      { style: "rap-hiphop", label: "Rap/Hip-Hop", weights: rap },
    ]);
    renderWithProviders(
      <StyleProfile style="rap-hiphop" description="Rima e batida." footnote="Para sempre." />,
    );

    expect(await screen.findByText("Pesa mais: letras, vocal e bateria.")).toBeVisible();
    expect(screen.getByText("Rima e batida.")).toBeVisible();
    expect(screen.getByText("Para sempre.")).toBeVisible();
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
