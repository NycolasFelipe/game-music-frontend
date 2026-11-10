import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioSessionLog } from "@/features/releases/components/StudioSessionLog";
import { renderWithProviders } from "@/test/render";

describe("StudioSessionLog", () => {
  it("keeps the situation and the choice in separate blocks", () => {
    renderWithProviders(
      <StudioSessionLog
        entries={[
          {
            id: "e-1",
            heading: "Sessão 1",
            prompt: "Ana quer mais 47 takes.",
            choice: "Deixar caprichar",
            effect: "×1,25",
          },
        ]}
      />,
    );

    expect(screen.getByText("Sessão 1")).toBeInTheDocument();
    expect(screen.getByText("“Ana quer mais 47 takes.”")).toBeInTheDocument();
    const choice = screen.getByText("Deixar caprichar", { exact: false });
    expect(choice).toHaveTextContent("Você escolheu · qualidade ×1,25Deixar caprichar");
  });

  it("says so when the recording had no hard session", () => {
    renderWithProviders(<StudioSessionLog entries={[]} />);
    expect(screen.getByText(/Nenhuma sessão difícil/)).toBeInTheDocument();
  });
});
