import { describe, expect, it } from "vitest";
import { earringStyleOf } from "@/features/bands/portrait/looks";
import type { PortraitSubject } from "@/features/bands/portrait/looks";

const subject = (id: string, gender: string): PortraitSubject => ({
  id,
  name: `Pessoa ${id}`,
  gender,
  age: 25,
  avatar: "",
  happiness: 0,
});

describe("earringStyleOf", () => {
  it("returns none for whoever does not wear earrings", () => {
    expect(earringStyleOf(subject("a", "female"), false)).toBe("none");
  });

  it("keeps the same style for the same person", () => {
    const person = subject("b-123", "male");
    expect(earringStyleOf(person, true)).toBe(earringStyleOf(person, true));
  });

  it("spreads people over several styles, not only studs", () => {
    const styles = new Set(
      Array.from({ length: 200 }, (_, i) => earringStyleOf(subject(`id-${i}`, i % 2 ? "female" : "male"), true)),
    );
    for (const style of ["stud", "hoop", "smallhoop", "cross", "drop", "single"]) {
      expect(styles.has(style as never)).toBe(true);
    }
  });
});
