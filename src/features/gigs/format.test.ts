import { describe, expect, it } from "vitest";
import { expectationNote, reactionNote, stageFit, stageStanding } from "@/features/gigs/format";

describe("stage comparison", () => {
  it("grades the band against the house's bar", () => {
    expect(stageFit(0.3, 0.15)).toBe("sobra");
    expect(stageFit(0.17, 0.15)).toBe("da-conta");
    expect(stageFit(0.12, 0.15)).toBe("devendo");
    expect(stageFit(0.05, 0.15)).toBe("engolida");
  });

  it("speaks in words before and after the show", () => {
    expect(expectationNote("devendo")).toBe("a casa vai cobrar");
    expect(reactionNote("sobra")).toBe("A banda sobrou no palco");
  });

  it("sums up the stage against the hardest house the fame opens", () => {
    const previews = [
      { available: true, expectedPerformance: 0.15 },
      { available: true, expectedPerformance: 0.18 },
      { available: false, expectedPerformance: 0.25 },
    ];
    expect(stageStanding(0.17, previews)).toBe("No limite");
    expect(stageStanding(0.3, previews)).toBe("Sobra");
    expect(stageStanding(0.2, [])).toBe("—");
  });
});
