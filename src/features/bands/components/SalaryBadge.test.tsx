import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SalaryBadge } from "@/features/bands/components/SalaryBadge";
import { renderWithProviders } from "@/test/render";

describe("SalaryBadge", () => {
  it("formats the salary amount (pt-BR) when paid", () => {
    renderWithProviders(
      <SalaryBadge salary={1500} target={1000} atRisk={false} />,
    );
    expect(screen.getByText("💵 1.500")).toBeInTheDocument();
  });

  it("warns with a ⚠️ marker when at risk", () => {
    renderWithProviders(<SalaryBadge salary={200} target={400} atRisk />);
    expect(screen.getByText("⚠️ 200")).toBeInTheDocument();
  });
});
