import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBolt,
  IconPlayerTrackNext,
  IconSparkles,
  IconWorld,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { MemberHoverName, useCharacteristics } from "@/features/bands";
import type { BandDetail, BandMember, Characteristic } from "@/features/bands";
import {
  useActiveEvents,
  usePassiveEvents,
  useResolveActiveEvent,
} from "@/features/events";
import { useAdvanceTurn } from "@/features/turns";
import { formatPeriod } from "@/utils/period";

interface TimelineEntry {
  key: string;
  year: number;
  kind: "passive" | "active";
  title?: string;
  description: string;
  resolved?: boolean;
  chosenLabel?: string;
  outcome?: string;
}

/** Main tab: advance turns, resolve pending decisions, and read the timeline. */
export function BandTimelineTab({ band }: { band: BandDetail }) {
  const bandId = band.id;
  const { data: activeEvents, isLoading: loadingActive } =
    useActiveEvents(bandId);
  const { data: passiveEvents, isLoading: loadingPassive } =
    usePassiveEvents(bandId);
  const advance = useAdvanceTurn(bandId);
  const resolve = useResolveActiveEvent(bandId);
  const { data: characteristics } = useCharacteristics();

  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((c) => [c.id, c]),
      ),
    [characteristics],
  );

  const memberById = new Map(band.members.map((m) => [m.id, m]));
  const pending = (activeEvents ?? []).filter((e) => !e.resolved);
  const pendingEvent = pending[0] ?? null;
  const involvedMembers = pendingEvent
    ? pendingEvent.involvedCharacterIds
        .map((id) => memberById.get(id))
        .filter((m): m is BandMember => Boolean(m))
    : [];

  function handleAdvance() {
    advance.mutate(undefined, {
      onSuccess: (result) => {
        notifications.show({
          title: `Turno avançado — ${result.period}`,
          message: result.activeEvent
            ? "Um evento requer sua decisão!"
            : result.passiveEvent
              ? "Novidades na cena musical."
              : "Tudo tranquilo por enquanto.",
          color: result.activeEvent ? "yellow" : "blue",
        });
      },
      onError: () =>
        notifications.show({
          color: "red",
          message: "Resolva o evento pendente antes de avançar.",
        }),
    });
  }

  function handleResolve(optionId: string) {
    if (!pendingEvent) return;
    resolve.mutate(
      { eventId: pendingEvent.id, optionId },
      {
        onSuccess: (res) => {
          notifications.show({
            title: res.event.title,
            message:
              res.outcome.description +
              (res.fameChange.leveledUp
                ? ` · Subiu para o Nível ${res.fameChange.newLevel} de fama!`
                : ""),
            color: "teal",
          });
        },
        onError: () =>
          notifications.show({
            color: "red",
            message: "Falha ao resolver o evento.",
          }),
      },
    );
  }

  const entries: TimelineEntry[] = [
    ...(passiveEvents ?? []).map((p) => ({
      key: `p-${p.id}`,
      year: p.year,
      kind: "passive" as const,
      description: p.description,
    })),
    ...(activeEvents ?? []).map((a) => ({
      key: `a-${a.id}`,
      year: a.year,
      kind: "active" as const,
      title: a.title,
      description: a.description,
      resolved: a.resolved,
      chosenLabel: a.options.find((o) => o.id === a.chosenOptionId)?.label,
      outcome: a.outcome?.description,
    })),
  ].sort((x, y) => y.year - x.year);

  const loading = loadingActive || loadingPassive;

  return (
    <Stack gap="xl">
      {/* Advance control */}
      <Group justify="space-between" wrap="wrap">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Período atual
          </Text>
          <Text fz={20} fw={700}>
            {formatPeriod(band.currentYear)}
          </Text>
        </div>
        <Button
          size="md"
          leftSection={<IconPlayerTrackNext size={18} />}
          onClick={handleAdvance}
          loading={advance.isPending}
          disabled={Boolean(pendingEvent)}
        >
          Avançar turno
        </Button>
      </Group>

      {/* Pending decision */}
      {pendingEvent && (
        <Card withBorder radius="md" padding="lg" bg="var(--mantine-color-yellow-light)">
          <Stack gap="sm">
            <Badge
              color="yellow"
              leftSection={<IconBolt size={12} />}
              w="fit-content"
            >
              Decisão pendente
            </Badge>
            <Title order={4}>{pendingEvent.title}</Title>
            <Text size="sm">{pendingEvent.description}</Text>
            {involvedMembers.length > 0 && (
              <Group gap="lg">
                <Text size="xs" c="dimmed" fw={600}>
                  Envolvidos:
                </Text>
                {involvedMembers.map((member) => (
                  <MemberHoverName
                    key={member.id}
                    member={member}
                    catalog={catalog}
                  />
                ))}
              </Group>
            )}

            <Stack gap="xs" mt="xs">
              {pendingEvent.options.map((option) => (
                <Button
                  key={option.id}
                  variant="default"
                  fullWidth
                  justify="flex-start"
                  h="auto"
                  py="sm"
                  onClick={() => handleResolve(option.id)}
                  disabled={resolve.isPending}
                >
                  <Stack gap={2} align="flex-start" style={{ width: "100%" }}>
                    <Text fw={600} size="sm">
                      {option.label}
                    </Text>
                    <Text
                      size="xs"
                      c="dimmed"
                      style={{ whiteSpace: "normal", textAlign: "left" }}
                    >
                      {option.description}
                    </Text>
                  </Stack>
                </Button>
              ))}
            </Stack>
            {resolve.isPending && (
              <Group gap="xs">
                <Loader size="xs" />
                <Text size="xs" c="dimmed">
                  Aplicando consequências…
                </Text>
              </Group>
            )}
          </Stack>
        </Card>
      )}

      {/* Timeline */}
      <div>
        <Title order={5} mb="md">
          Linha do tempo
        </Title>

        {loading && <Loader />}

        {!loading && entries.length === 0 && (
          <Text size="sm" c="dimmed">
            Avance turnos para a história da banda começar a acontecer.
          </Text>
        )}

        {entries.length > 0 && (
          <Timeline bulletSize={24} lineWidth={2} active={-1}>
            {entries.map((entry) => {
              const color =
                entry.kind === "passive"
                  ? "gray"
                  : entry.resolved
                    ? "teal"
                    : "yellow";
              const bullet =
                entry.kind === "passive" ? (
                  <IconWorld size={13} />
                ) : entry.resolved ? (
                  <IconSparkles size={13} />
                ) : (
                  <IconBolt size={13} />
                );

              return (
                <Timeline.Item
                  key={entry.key}
                  color={color}
                  bullet={bullet}
                  title={
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm" fw={600}>
                        {entry.title ?? "Cena musical"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatPeriod(entry.year)}
                      </Text>
                    </Group>
                  }
                >
                  <Text size="sm" c="dimmed">
                    {entry.description}
                  </Text>
                  {entry.kind === "active" && entry.resolved && (
                    <Text size="xs" mt={4}>
                      Você escolheu:{" "}
                      <Text span fw={600}>
                        {entry.chosenLabel ?? "—"}
                      </Text>
                      {entry.outcome ? ` — ${entry.outcome}` : ""}
                    </Text>
                  )}
                  {entry.kind === "active" && !entry.resolved && (
                    <Badge size="xs" color="yellow" mt={4}>
                      Decisão pendente
                    </Badge>
                  )}
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
      </div>
    </Stack>
  );
}
