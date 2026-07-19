import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/EmptyState";
import { renderWithProviders } from "@/test/render";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    renderWithProviders(
      <EmptyState title="Nenhuma banda ainda" description="Crie a primeira." />,
    );

    expect(screen.getByText("Nenhuma banda ainda")).toBeInTheDocument();
    expect(screen.getByText("Crie a primeira.")).toBeInTheDocument();
  });
});
