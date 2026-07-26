import { Badge, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBolt } from "@tabler/icons-react";
import { useEffect, useMemo, useRef } from "react";
import { useCharacteristics } from "@/features/bands";
import type { BandDetail, Characteristic } from "@/features/bands";
import { usePendingDecisions } from "@/features/decisions/hooks/usePendingDecisions";
import { useDecisionsUi } from "@/features/decisions/store/decisions.store";
import { ActiveEventDecision, useResolveActiveEvent } from "@/features/events";
import {
  CreationEventStage,
  useFinalizeRelease,
  useReleaseRevealUi,
  useResolveCreationEvent,
} from "@/features/releases";

/**
 * The band's inbox: every decision that holds the clock, one at a time and in
 * one place. It opens by itself as soon as something new needs an answer, so a
 * studio session no longer waits behind the Discografia tab for the player to
 * go looking for it.
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
            color: "teal",
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

  return (
    <Modal
      opened={open && Boolean(current)}
      onClose={closeDecisions}
      centered
      size="lg"
      title={
        <Group gap={8}>
          <IconBolt size={18} />
          <Text fw={700}>
            {current?.kind === "launch"
              ? "Saiu do estúdio"
              : "A banda precisa de você"}
          </Text>
          {decisions.length > 1 && (
            <Badge variant="light" color="yellow">
              1 de {decisions.length}
            </Badge>
          )}
        </Group>
      }
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
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            No estúdio, gravando{" "}
            <Text span fw={700}>
              &ldquo;{current.releaseTitle}&rdquo;
            </Text>
          </Text>
          <CreationEventStage
            event={current.event}
            index={current.index}
            total={current.total}
            pending={resolveSession.isPending}
            onChoose={handleSessionChoice}
          />
        </Stack>
      )}

      {current?.kind === "launch" && (
        <Stack align="center" gap="xs" py="sm">
          <Text fz={44} lh={1}>
            💿
          </Text>
          <Text fw={700} fz="lg" ta="center">
            &ldquo;{current.releaseTitle}&rdquo; está pronta
          </Text>
          <Text size="sm" c="dimmed" ta="center" maw={400}>
            A gravação terminou. Prense o disco quando quiser — ele espera no
            rascunho até você mandar para o mundo.
          </Text>
          <Group mt="sm">
            <Button variant="default" onClick={closeDecisions}>
              Ainda não
            </Button>
            <Button
              size="md"
              onClick={handleLaunch}
              loading={finalize.isPending}
            >
              🚀 Lançar {current.formatLabel}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
