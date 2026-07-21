import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SalaryBadge } from "@/features/bands/components/SalaryBadge";
import { renderWithProviders } from "@/test/render";

describe("SalaryBadge", () => {
  it("formats the salary amount (pt-BR) when paid", () => {
    renderWithProviders(
      <SalaryBadge salary={1500} target={1000} turnsUntilDeparture={null} />,
    );
    expect(screen.getByText("💵 1.500")).toBeInTheDocument();
  });

  it("warns with a ⚠️ marker when in arrears", () => {
    renderWithProviders(
      <SalaryBadge salary={200} target={400} turnsUntilDeparture={2} />,
    );
    expect(screen.getByText("⚠️ 200")).toBeInTheDocument();
  });
});
