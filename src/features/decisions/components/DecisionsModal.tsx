import { Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useRef } from "react";
import { InsertModal } from "@/components/revista";
import { useCharacteristics } from "@/features/bands";
import type { BandDetail, Characteristic } from "@/features/bands";
import { usePendingDecisions } from "@/features/decisions/hooks/usePendingDecisions";
import { useDecisionsUi } from "@/features/decisions/store/decisions.store";
import { ActiveEventDecision, useResolveActiveEvent } from "@/features/events";
import {
  CreationEventStage,
  LaunchSummary,
  useFinalizeRelease,
  useReleaseRevealUi,
  useResolveCreationEvent,
} from "@/features/releases";

/**
 * The band's inbox: every decision that holds the clock, one at a time and in
 * one place, as a magazine insert (ADR-0002). It opens by itself as soon as
 * something new needs an answer, so a studio session no longer waits behind
 * the Discografia tab for the player to go looking for it.
 *
 * @param props.band - The band whose decisions are pending.
 */
export function DecisionsModal({ band }: { band: BandDetail }) {
  const bandId = band.id;
  const { decisions, draftId } = usePendingDecisions(bandId);
  const { open, openDecisions, closeDecisions } = useDecisionsUi();
  const { data: characteristics } = useCharacteristics();

  const resolveEvent = useResolveActiveEvent(bandId);
  const resolveSession = useResolveCreationEvent(bandId, draftId ?? "");
  const finalize = useFinalizeRelease(bandId);
  const revealRelease = useReleaseRevealUi((state) => state.revealRelease);

  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((c) => [c.id, c]),
      ),
    [characteristics],
  );

  // Whatever is waiting is answered in order; the modal follows the queue.
  const current = decisions[0] ?? null;
  const signature = decisions.map((decision) => decision.key).join("|");
  const lastSignature = useRef<string | null>(null);

  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    if (signature) {
      openDecisions();
    } else {
      closeDecisions();
    }
  }, [signature, openDecisions, closeDecisions]);

  function handleEventChoice(optionId: string) {
    if (current?.kind !== "band") return;
    resolveEvent.mutate(
      { eventId: current.event.id, optionId },
      {
        onSuccess: (res) =>
          notifications.show({
            title: res.event.title,
            message:
              res.outcome.description +
              (res.fameChange.leveledUp
                ? ` · Subiu para o Nível ${res.fameChange.newLevel} de fama!`
                : ""),
            color: "ink",
          }),
        onError: () =>
          notifications.show({
            color: "red",
            message: "Falha ao resolver o evento.",
          }),
      },
    );
  }

  function handleSessionChoice(optionId: string) {
    if (current?.kind !== "studio") return;
    resolveSession.mutate(
      { eventId: current.event.id, optionId },
      {
        onError: () =>
          notifications.show({
            color: "red",
            message: "Falha ao registrar a decisão de estúdio.",
          }),
      },
    );
  }

  function handleLaunch() {
    if (current?.kind !== "launch") return;
    closeDecisions();
    finalize.mutate(current.releaseId, {
      onSuccess: (release) => revealRelease(release),
      onError: () =>
        notifications.show({
          color: "red",
          message: "Falha ao lançar a obra.",
        }),
    });
  }

  const section =
    current?.kind === "launch"
      ? "Lançamento"
      : current?.kind === "studio"
        ? `No estúdio · gravando “${current.releaseTitle}”`
        : "Decisão pendente · trava o fechamento da edição";
  const heading =
    current?.kind === "band"
      ? current.event.title
      : current?.kind === "studio"
        ? "A banda precisa de você"
        : current?.kind === "launch"
          ? `“${current.releaseTitle}” está pronta.`
          : "";

  return (
    <InsertModal
      opened={open && Boolean(current)}
      onClose={closeDecisions}
      label={
        <>
          {section}
          {decisions.length > 1 && (
            <>
              {" · "}
              <span className="rv-red">1 de {decisions.length}</span>
            </>
          )}
        </>
      }
      title={heading}
      size="lg"
    >
      {current?.kind === "band" && (
        <ActiveEventDecision
          event={current.event}
          members={band.members}
          catalog={catalog}
          pending={resolveEvent.isPending}
          onChoose={handleEventChoice}
        />
      )}

      {current?.kind === "studio" && (
        <CreationEventStage
          event={current.event}
          index={current.index}
          total={current.total}
          pending={resolveSession.isPending}
          onChoose={handleSessionChoice}
        />
      )}

      {current?.kind === "launch" && (
        <div>
          <LaunchSummary bandId={bandId} releaseId={current.releaseId} balance={band.balance} />
          <p className="rv-caption">
            O disco espera no rascunho até você mandar para o mundo.
          </p>
          <Group justify="flex-end" mt="lg" gap="xs">
            <Button variant="default" onClick={closeDecisions}>
              Ainda não
            </Button>
            <Button color="press" onClick={handleLaunch} loading={finalize.isPending}>
              Lançar {current.formatLabel}
            </Button>
          </Group>
        </div>
      )}
    </InsertModal>
  );
}
