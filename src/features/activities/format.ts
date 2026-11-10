import type { ActivityResult } from "@/features/activities/types";

/**
 * Manchete do resultado de uma confraternização, no tom da revista.
 *
 * @param result - O resultado da saída.
 * @param label - O nome da atividade.
 * @returns O título do encarte.
 */
export function activityOutcomeTitle(result: ActivityResult, label: string): string {
  return result.trouble ? `${label}, e a noite virou` : `${label} sem vítimas`;
}
