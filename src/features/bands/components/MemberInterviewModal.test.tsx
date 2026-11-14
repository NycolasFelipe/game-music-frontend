import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemberInterviewModal } from "@/features/bands/components/MemberInterviewModal";
import { bandmateOpinions } from "@/features/bands/opinions";
import * as api from "@/features/bands/services/bands.api";
import type { BandMember, Characteristic } from "@/features/bands/types";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/bands/services/bands.api", () => ({
  updateMemberSalary: vi.fn(),
  getMemberSalaryHistory: vi.fn(),
  getHappinessLevels: vi.fn(),
  getSkillDescriptions: vi.fn(),
  getRelationshipLevels: vi.fn(),
}));

const member: BandMember = {
  id: "m-1",
  bandId: "b-1",
  name: "João Silva",
  age: 24,
  gender: "male",
  avatar: "👨",
  happiness: 1.2,
  characteristics: ["perfectionist"],
  skills: { vocal: 1, guitar: 4, bass: 1, drums: 1, piano: 1, lyrics: 1 },
  biography: "Tocava em bailes de formatura.",
  primarySkill: "guitar",
  joinYear: null,
  salary: 300,
  salaryTarget: 400,
  salaryUnpaidTurns: 0,
  salaryAtRisk: false,
};

const catalog = new Map<string, Characteristic>([
  ["perfectionist", { id: "perfectionist", name: "Perfeccionista", description: "Refaz até ficar perfeito." } as Characteristic],
]);

describe("MemberInterviewModal", () => {
  beforeEach(() => {
    vi.mocked(api.updateMemberSalary).mockResolvedValue({ ...member, salary: 500 });
    vi.mocked(api.getMemberSalaryHistory).mockResolvedValue([
      { amount: 300, effectiveYear: 1980.5, reason: "inicial" },
    ] as Awaited<ReturnType<typeof api.getMemberSalaryHistory>>);
    vi.mocked(api.getHappinessLevels).mockResolvedValue([
      { level: 1, emoji: "", name: "Contente", description: "Tá tudo bem por aqui." },
    ]);
    vi.mocked(api.getRelationshipLevels).mockResolvedValue([
      { level: -2, emoji: "", name: "Desgosto Moderado", description: "Dividimos o palco, mas não dividimos a pizza." },
    ]);
    vi.mocked(api.getSkillDescriptions).mockResolvedValue({} as Awaited<ReturnType<typeof api.getSkillDescriptions>>);
  });

  it("reads like an interview: mood quote, bio, traits and salary history", async () => {
    renderWithProviders(
      <MemberInterviewModal bandId="b-1" member={member} catalog={catalog} onClose={vi.fn()} />,
    );

    expect(await screen.findByText("João Silva")).toBeInTheDocument();
    expect(await screen.findByText(/Tá tudo bem por aqui/)).toBeInTheDocument();
    expect(screen.getByText(/Contente/)).toBeInTheDocument();
    expect(screen.getByText("Tocava em bailes de formatura.")).toBeInTheDocument();
    expect(screen.getByText("Refaz até ficar perfeito.")).toBeInTheDocument();
    expect(screen.getByText(/abaixo do alvo/)).toBeInTheDocument();
    expect(await screen.findByText(/28 set. 1980 · inicial/)).toBeInTheDocument();
  });

  it("gives the member's take on each bandmate, from their relationship level", async () => {
    const mate: BandMember = { ...member, id: "m-2", name: "Ana Souza" };
    renderWithProviders(
      <MemberInterviewModal
        bandId="b-1"
        member={member}
        members={[member, mate]}
        relationships={[{ memberAId: "m-2", memberBId: "m-1", level: -2 } as never]}
        catalog={catalog}
        onClose={vi.fn()}
      />,
    );

    expect(await screen.findByText("Sobre os colegas")).toBeInTheDocument();
    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
    expect(await screen.findByText("Desgosto Moderado · -2")).toBeInTheDocument();
    const expected = bandmateOpinions("m-1", [{ id: "m-2", name: "Ana Souza", level: -2 }]).get("m-2");
    expect(screen.getByText(`“${expected}”`)).toBeInTheDocument();
  });

  it("submits the new salary to the API", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <MemberInterviewModal bandId="b-1" member={member} catalog={catalog} onClose={onClose} />,
    );

    const input = await screen.findByLabelText("Novo salário por turno");
    fireEvent.change(input, { target: { value: "500" } });
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(api.updateMemberSalary).toHaveBeenCalledWith("b-1", "m-1", 500),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
