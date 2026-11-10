import { describe, expect, it } from "vitest";
import { marketNote } from "@/features/releases/market";

describe("marketNote", () => {
  it("calls the first work of the year good news", () => {
    expect(marketNote(0, 1)).toEqual({
      text: "Nenhuma obra lançada este ano: o público está com fome de disco novo.",
      penalty: false,
    });
  });

  it("says how much of the normal a later work earns, in percent", () => {
    expect(marketNote(1, 0.6).text).toBe("Já saiu 1 obra este ano: a próxima rende 60% do normal.");
    expect(marketNote(2, 0.35, "esta")).toEqual({
      text: "Já saíram 2 obras este ano: esta rende 35% do normal.",
      penalty: true,
    });
  });
});
