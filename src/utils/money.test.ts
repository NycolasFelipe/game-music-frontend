import { describe, expect, it } from "vitest";
import { formatMoney } from "@/utils/money";

describe("formatMoney", () => {
  it("puts the dollar sign in front, with pt-BR thousands", () => {
    expect(formatMoney(5000)).toBe("$5.000");
    expect(formatMoney(3495.1)).toBe("$3.495");
  });

  it("puts the minus sign before the dollar sign", () => {
    expect(formatMoney(-373)).toBe("−$373");
  });

  it("only signs positives when asked", () => {
    expect(formatMoney(120, { signed: true })).toBe("+$120");
    expect(formatMoney(0, { signed: true })).toBe("$0");
  });
});
