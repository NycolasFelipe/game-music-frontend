import { describe, expect, it } from "vitest";
import type { BandMember, Skills } from "@/features/bands";
import {
  bestMemberFor,
  chemistryFactor,
  creditLoad,
  focusFactor,
  importanceStars,
  uncoveredCrucialAspects,
} from "@/features/releases/creation-forecast";

const skills = (partial: Partial<Skills>): Skills => ({
  vocal: 0,
  guitar: 0,
  bass: 0,
  drums: 0,
  piano: 0,
  lyrics: 0,
  ...partial,
});

const member = (
  id: string,
  partial: Partial<Skills>,
  happiness = 0,
): BandMember =>
  ({
    id,
    name: id,
    skills: skills(partial),
    happiness,
  }) as BandMember;

/** A style that lives on guitar and vocals. */
const weights: Record<keyof Skills, number> = {
  guitar: 0.3,
  vocal: 0.25,
  drums: 0.2,
  bass: 0.15,
  lyrics: 0.07,
  piano: 0.03,
};

describe("focusFactor (ADR-0014 §1)", () => {
  it("is full for one aspect and decays as the member spreads out", () => {
    expect(focusFactor(1)).toBe(1);
    expect(focusFactor(2)).toBeLessThan(1);
    expect(focusFactor(6)).toBeLessThan(focusFactor(4));
    expect(focusFactor(0)).toBe(0);
  });
});

describe("creditLoad", () => {
  it("counts the distinct aspects each member took on", () => {
    const load = creditLoad({ guitar: ["m1", "m2"], vocal: ["m1"] });
    expect(load.get("m1")).toBe(2);
    expect(load.get("m2")).toBe(1);
  });
});

describe("chemistryFactor (ADR-0014 §2)", () => {
  const relationships = [
    { memberAId: "m1", memberBId: "m2", level: 5 },
    { memberAId: "m1", memberBId: "m3", level: -5 },
  ];

  it("is neutral alone, positive with a friend and negative with a rival", () => {
    expect(chemistryFactor(["m1"], relationships)).toBe(1);
    expect(chemistryFactor(["m1", "m2"], relationships)).toBeGreaterThan(1);
    expect(chemistryFactor(["m1", "m3"], relationships)).toBeLessThan(1);
  });
});

describe("importanceStars", () => {
  it("grades an aspect's weight into 1..3 stars", () => {
    expect(importanceStars(0.3)).toBe(3);
    expect(importanceStars(0.2)).toBe(2);
    expect(importanceStars(0.03)).toBe(1);
  });
});

describe("uncoveredCrucialAspects", () => {
  it("lists the heavy aspects nobody covers, heaviest first", () => {
    expect(uncoveredCrucialAspects({ vocal: ["m1"] }, weights)).toEqual([
      "guitar",
      "drums",
    ]);
  });

  it("stays quiet when every heavy aspect is covered", () => {
    expect(
      uncoveredCrucialAspects(
        { guitar: ["m1"], vocal: ["m1"], drums: ["m1"] },
        weights,
      ),
    ).toEqual([]);
  });
});

describe("bestMemberFor", () => {
  it("points at the highest skill in the aspect", () => {
    const members = [member("m1", { guitar: 3 }), member("m2", { guitar: 7 })];
    expect(bestMemberFor(members, "guitar")).toBe("m2");
  });

  it("returns null when nobody has the skill at all", () => {
    expect(bestMemberFor([member("m1", {})], "guitar")).toBeNull();
  });
});
