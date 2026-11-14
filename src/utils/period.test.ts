import { describe, expect, it } from "vitest";
import { formatPeriod, turnDate } from "@/utils/period";

describe("turnDate", () => {
  it("matches the vectors shared with the backend copy (ADR-0033)", () => {
    expect(turnDate("band-1", 1995)).toEqual({ year: 1995, month: 3, day: 23 });
    expect(turnDate("band-1", 1995.5)).toEqual({ year: 1995, month: 12, day: 31 });
    expect(turnDate("3f2a9c1e-0000-4000-8000-000000000000", 1968)).toEqual({
      year: 1968,
      month: 5,
      day: 16,
    });
  });

  it("keeps the first turn in January–July and the second in August–December", () => {
    for (let index = 0; index < 300; index += 1) {
      const first = turnDate(`band-${index}`, 2001);
      const second = turnDate(`band-${index}`, 2001.5);
      expect(first.month).toBeLessThanOrEqual(7);
      expect(second.month).toBeGreaterThanOrEqual(8);
    }
  });
});

describe("formatPeriod", () => {
  it("writes the long date by default", () => {
    expect(formatPeriod(2003.5, "band-1")).toBe("8 de setembro de 2003");
  });

  it("writes the short date for lists", () => {
    expect(formatPeriod(2003.5, "band-1", "short")).toBe("8 set. 2003");
  });

  it("never mentions a semester", () => {
    expect(formatPeriod(1980, "x")).not.toMatch(/semestre/);
  });
});
