import { describe, expect, it } from "vitest";
import type { BandMember, Skills } from "@/features/bands";
import {
  bestMemberFor,
  forecastQuality,
  importanceStars,
  moodModifier,
  skillScore,
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

describe("skillScore", () => {
  it("weighs each aspect by how much the style depends on it", () => {
    const members = [member("m1", { guitar: 10, piano: 10 })];

    const onGuitar = skillScore({ guitar: ["m1"] }, members, weights);
    const onPiano = skillScore({ piano: ["m1"] }, members, weights);

    expect(onGuitar).toBeCloseTo(0.3);
    expect(onPiano).toBeCloseTo(0.03);
  });

  it("averages co-credited members, so a rookie drags the aspect down", () => {
    const members = [member("m1", { guitar: 10 }), member("m2", { guitar: 0 })];

    expect(skillScore({ guitar: ["m1", "m2"] }, members, weights)).toBeCloseTo(
      0.15,
    );
  });

  it("scores an uncredited aspect as zero", () => {
    expect(skillScore({}, [member("m1", { guitar: 10 })], weights)).toBe(0);
  });
});

describe("moodModifier", () => {
  it("lifts a happy line-up and drags an unhappy one", () => {
    const happy = [member("m1", { guitar: 5 }, 5)];
    const sad = [member("m1", { guitar: 5 }, -5)];

    expect(moodModifier({ guitar: ["m1"] }, happy)).toBeCloseTo(1.15);
    expect(moodModifier({ guitar: ["m1"] }, sad)).toBeCloseTo(0.85);
  });

  it("is neutral when nobody is credited", () => {
    expect(moodModifier({}, [member("m1", { guitar: 5 }, 5)])).toBe(1);
  });
});

describe("forecastQuality", () => {
  it("combines line-up, mood and budget into a 0..100 forecast", () => {
    const members = [member("m1", { guitar: 10, vocal: 10 }, 0)];

    const quality = forecastQuality(
      { guitar: ["m1"], vocal: ["m1"] },
      members,
      weights,
      1.2,
    );

    // (0.30 + 0.25) × 1 × 1.2 = 0.66
    expect(quality).toBe(66);
  });

  it("never leaves the 0..100 range", () => {
    const members = [
      member("m1", {
        guitar: 10,
        vocal: 10,
        drums: 10,
        bass: 10,
        lyrics: 10,
        piano: 10,
      }, 5),
    ];
    const credits = {
      guitar: ["m1"],
      vocal: ["m1"],
      drums: ["m1"],
      bass: ["m1"],
      lyrics: ["m1"],
      piano: ["m1"],
    };

    expect(forecastQuality(credits, members, weights, 1.5)).toBe(100);
    expect(forecastQuality({}, members, weights, 1.5)).toBe(0);
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
