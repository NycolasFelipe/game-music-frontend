import type { PendingDecision } from "@/features/decisions/types";
import { useActiveEvents } from "@/features/events";
import {
  useRelease,
  useReleaseFormats,
  useReleases,
} from "@/features/releases";

/**
 * Everything waiting on the player, from wherever it came: the events in the
 * band's life, the sessions of the work being recorded and the record that came
 * out of the studio ready to go. Gathering it in one place is what lets the
 * player answer without hunting through tabs.
 *
 * `blocking` is the subset that holds the clock (ADR-0015) — putting a finished
 * work out is an opportunity, not an obligation, so it never stops the turn.
 *
 * @param bandId - The band whose pending items to collect.
 * @returns The queue in answering order, the blocking subset and the draft's id.
 */
export function usePendingDecisions(bandId: string) {
  const { data: activeEvents } = useActiveEvents(bandId);
  const { data: releases } = useReleases(bandId);
  const { data: formats } = useReleaseFormats();

  const draft = releases?.find((r) => r.status === "em_criacao") ?? null;
  const { data: draftDetail } = useRelease(bandId, draft?.id ?? null);

  const decisions: PendingDecision[] = (activeEvents ?? [])
    .filter((event) => !event.resolved)
    .map((event) => ({ key: `band:${event.id}`, kind: "band" as const, event }));

  if (draftDetail) {
    const sessions = draftDetail.creationEvents;
    const resolved = sessions.filter((session) => session.resolved).length;
    const format = formats?.find((f) => f.id === draftDetail.format);
    // One session per production turn, so the format says how many there will
    // be — counting the ones drawn so far would announce a shorter record.
    const total = format?.productionTurns ?? sessions.length;
    const openSessions = sessions.filter((session) => !session.resolved);

    openSessions.forEach((session, offset) =>
      decisions.push({
        key: `studio:${session.id}`,
        kind: "studio",
        releaseId: draftDetail.id,
        releaseTitle: draftDetail.title,
        event: session,
        index: resolved + offset + 1,
        total: Math.max(total, resolved + offset + 1),
      }),
    );

    // Out of the studio with nothing left to answer: it is ready to go out.
    if (openSessions.length === 0 && draftDetail.productionTurnsLeft === 0) {
      decisions.push({
        key: `launch:${draftDetail.id}`,
        kind: "launch",
        releaseId: draftDetail.id,
        releaseTitle: draftDetail.title,
        formatLabel: format?.label ?? "obra",
      });
    }
  }

  const blocking = decisions.filter((decision) => decision.kind !== "launch");

  return { decisions, blocking, draftId: draft?.id ?? null };
}
