import { describe, expect, it } from "vitest";
import { marketNote } from "@/features/releases/market";

describe("marketNote", () => {
  it("calls the first work of the year good news", () => {
    expect(marketNote(0, 1)).toEqual({
      text: "Nenhuma obra lançada este ano: o público está com fome de disco novo.",
      penalty: false,
    });
  });

  it("warns about a crowded year in the magazine's voice, without percentages", () => {
    const notes = [marketNote(1, 0.6), marketNote(2, 0.35), marketNote(3, 0.2)];
    for (const note of notes) {
      expect(note.penalty).toBe(true);
      expect(note.text).not.toMatch(/%|\d/);
    }
    // Each step of the saturation reads differently, so the loss still shows.
    expect(new Set(notes.map((note) => note.text)).size).toBe(3);
  });

  it("names the work the way the caller asks", () => {
    expect(marketNote(1, 0.6, "esta obra").text).toBe(
      "O público ainda está decorando o último disco. Esta obra vai disputar atenção com ele e render bem menos.",
    );
  });
});
