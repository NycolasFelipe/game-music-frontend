import { describe, expect, it } from "vitest";
import { bandmateOpinions } from "@/features/bands/opinions";

describe("bandmateOpinions", () => {
  const mates = ["a", "b", "c", "d", "e"].map((id) => ({ id, name: `Colega ${id.toUpperCase()} Silva`, level: 4 }));

  it("never repeats a line in the same interview, even with everyone on the same level", () => {
    const lines = [...bandmateOpinions("speaker", mates).values()];
    expect(new Set(lines).size).toBe(mates.length);
  });

  it("keeps the same line for the same pair across openings", () => {
    expect(bandmateOpinions("speaker", mates)).toEqual(bandmateOpinions("speaker", mates));
  });

  it("names the bandmate by first name and never leaves the placeholder", () => {
    const lines = [...bandmateOpinions("x", [{ id: "a", name: "Iara Lacerda", level: -2 }]).values()];
    expect(lines[0]).not.toContain("{nome}");
  });
});
