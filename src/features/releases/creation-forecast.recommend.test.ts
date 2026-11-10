import { describe, expect, it } from "vitest";
import type { BandMember, MemberRelationship, Skills } from "@/features/bands";
import {
  bestMemberFor,
  creditsScore,
  recommendedCredits,
} from "@/features/releases/creation-forecast";
import type { ReleaseCredits } from "@/features/releases/types";

const ZERO: Skills = { vocal: 0, guitar: 0, bass: 0, drums: 0, piano: 0, lyrics: 0 };
const member = (id: string, skills: Partial<Skills>, happiness = 0): BandMember =>
  ({ id, name: id, happiness, skills: { ...ZERO, ...skills } }) as unknown as BandMember;
const GRUNGE = { guitar: 0.28, drums: 0.22, vocal: 0.22, bass: 0.12, lyrics: 0.12, piano: 0.04 };

describe("recommendedCredits", () => {
  it("puts each specialist on their own instrument", () => {
    const band = [
      member("g", { guitar: 8 }),
      member("d", { drums: 8 }),
      member("v", { vocal: 8 }),
      member("b", { bass: 8 }),
      member("l", { lyrics: 8 }),
      member("p", { piano: 8 }),
    ];
    expect(recommendedCredits(band, GRUNGE)).toEqual({
      guitar: ["g"],
      drums: ["d"],
      vocal: ["v"],
      bass: ["b"],
      lyrics: ["l"],
      piano: ["p"],
    });
  });

  it("lets a friend share the instrument when the pair is worth more", () => {
    const band = [member("a", { guitar: 6 }), member("b", { guitar: 6 })];
    const friends: MemberRelationship[] = [{ memberAId: "a", memberBId: "b", level: 5 }] as MemberRelationship[];
    const weights = { ...ZERO, guitar: 1 };
    expect(recommendedCredits(band, weights, friends).guitar).toEqual(["a", "b"]);
    const rivals = [{ ...friends[0], level: -5 }] as MemberRelationship[];
    expect(recommendedCredits(band, weights, rivals).guitar).toHaveLength(1);
  });

  it("never scores below the best player on every instrument", () => {
    let seed = 7;
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let round = 0; round < 25; round += 1) {
      const size = 3 + Math.floor(rand() * 4);
      const band = Array.from({ length: size }, (_, i) =>
        member(
          `m${i}`,
          {
            vocal: Math.floor(rand() * 6),
            guitar: Math.floor(rand() * 6),
            bass: Math.floor(rand() * 6),
            drums: Math.floor(rand() * 6),
            piano: Math.floor(rand() * 6),
            lyrics: Math.floor(rand() * 6),
          },
          Math.round(rand() * 10 - 5),
        ),
      );
      const naive: ReleaseCredits = {};
      for (const aspect of Object.keys(GRUNGE) as Array<keyof Skills>) {
        const best = bestMemberFor(band, aspect);
        if (best) naive[aspect] = [best];
      }
      expect(creditsScore(recommendedCredits(band, GRUNGE), band, GRUNGE)).toBeGreaterThanOrEqual(
        creditsScore(naive, band, GRUNGE) - 1e-9,
      );
    }
  });

  it("leaves a light instrument empty rather than overload the band", () => {
    // Three people, six jobs: piano weighs 4% and is not worth the focus it costs.
    const band = [
      member("a", { guitar: 6, piano: 1 }),
      member("b", { drums: 6, bass: 4 }),
      member("c", { vocal: 6, lyrics: 5 }),
    ];
    const credits = recommendedCredits(band, GRUNGE);
    expect(credits.guitar).toEqual(["a"]);
    expect(credits.drums).toEqual(["b"]);
    expect(credits.vocal).toEqual(["c"]);
    expect(credits.piano ?? []).toEqual([]);
  });
});
