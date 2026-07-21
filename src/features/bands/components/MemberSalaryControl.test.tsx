import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemberSalaryControl } from "@/features/bands/components/MemberSalaryControl";
import * as api from "@/features/bands/services/bands.api";
import type { BandMember } from "@/features/bands/types";
import { renderWithProviders } from "@/test/render";

vi.mock("@/features/bands/services/bands.api", () => ({
  updateMemberSalary: vi.fn(),
  getMemberSalaryHistory: vi.fn(),
}));

const member: BandMember = {
  id: "m-1",
  bandId: "b-1",
  name: "João",
  age: 24,
  gender: "male",
  avatar: "👨",
  happiness: 1,
  characteristics: [],
  skills: { vocal: 1, guitar: 1, bass: 1, drums: 1, piano: 1, lyrics: 1 },
  biography: "bio",
  primarySkill: "guitar",
  joinYear: null,
  salary: 300,
  salaryTarget: 400,
  salaryUnpaidTurns: 0,
  salaryAtRisk: false,
};

describe("MemberSalaryControl", () => {
  beforeEach(() => {
    vi.mocked(api.updateMemberSalary).mockResolvedValue({
      ...member,
      salary: 500,
    });
    vi.mocked(api.getMemberSalaryHistory).mockResolvedValue([]);
  });

  it("shows the current salary and opens the adjust popover", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MemberSalaryControl bandId="b-1" member={member} />);

    expect(screen.getByText("💵 300")).toBeInTheDocument();

    await user.click(screen.getByText("💵 300"));

    expect(await screen.findByLabelText("Novo salário")).toBeInTheDocument();
  });

  it("submits the new salary to the API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MemberSalaryControl bandId="b-1" member={member} />);

    await user.click(screen.getByText("💵 300"));
    const input = await screen.findByLabelText("Novo salário");
    fireEvent.change(input, { target: { value: "500" } });
    await user.click(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(api.updateMemberSalary).toHaveBeenCalledWith("b-1", "m-1", 500),
    );
  });
});
