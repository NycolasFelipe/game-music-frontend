import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bandKeys } from "@/features/bands/hooks/useBands";
import {
  getMemberSalaryHistory,
  updateMemberSalary,
} from "@/features/bands/services/bands.api";

/** Query keys for a member's salary history. */
export const salaryKeys = {
  history: (bandId: string, memberId: string) =>
    ["bands", bandId, "members", memberId, "salary-history"] as const,
};

/**
 * Adjusts a member's salary. Invalidates the band detail (member salary changes,
 * and the payroll may move the balance on the next turn) and the salary history.
 */
export function useUpdateMemberSalary(bandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, amount }: { memberId: string; amount: number }) =>
      updateMemberSalary(bandId, memberId, amount),
    onSuccess: (_member, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: bandKeys.detail(bandId) });
      queryClient.invalidateQueries({
        queryKey: salaryKeys.history(bandId, memberId),
      });
    },
  });
}

/**
 * Server-state query for a member's salary history. Pass `enabled` to defer the
 * fetch until it is actually shown (e.g. when a details panel opens).
 */
export function useMemberSalaryHistory(
  bandId: string,
  memberId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: salaryKeys.history(bandId, memberId),
    queryFn: () => getMemberSalaryHistory(bandId, memberId),
    enabled: enabled && Boolean(bandId) && Boolean(memberId),
  });
}
