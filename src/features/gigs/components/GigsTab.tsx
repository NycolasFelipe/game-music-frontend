import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock, IconMicrophone } from "@tabler/icons-react";
import { formatSkillLevel } from "@/features/bands";
import type { BandDetail } from "@/features/bands";
import { useGigs, useGigTypes, usePlayGig } from "@/features/gigs/hooks/useGigs";
import type { Gig, GigType } from "@/features/gigs/types";
import { formatPeriod } from "@/utils/period";

/** Stage art per circuit. */
const GIG_EMOJI: Record<string, string> = {
  covers: "🎤",
  bar: "🍺",
  pub: "🎸",
  "casa-shows": "🎭",
  festival: "🎪",
};

/** A performance (0..1) as five stars. */
function performanceStars(performance: number): string {
  const filled = Math.max(1, Math.min(5, Math.round(performance * 5)));
  return "⭐".repeat(filled) + "☆".repeat(5 - filled);
}

/** One circuit the band can book — or the fame level it still needs. */
function GigCard({
  type,
  fameLevel,
  balance,
  playedThisTurn,
  loading,
  onPlay,
}: {
  type: GigType;
  fameLevel: number;
  balance: number;
  playedThisTurn: boolean;
  loading: boolean;
  onPlay: () => void;
}) {
  const locked = fameLevel < type.minFameLevel;
  const affordable = balance >= type.cost;

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{ opacity: locked ? 0.6 : 1 }}
    >
      <Stack gap={6} h="100%">
        <Group gap={8} wrap="nowrap" justify="space-between">
          <Group gap={8} wrap="nowrap">
            <Text fz={26} lh={1}>
              {GIG_EMOJI[type.id] ?? "🎤"}
            </Text>
            <Text fw={700}>{type.label}</Text>
          </Group>
          {locked && (
            <Badge
              color="gray"
              variant="light"
              leftSection={<IconLock size={11} />}
            >
              Nível {type.minFameLevel}
            </Badge>
          )}
        </Group>

        <Text size="xs" c="dimmed" lh={1.35} style={{ flex: 1 }}>
          {type.description}
        </Text>

        <Group gap="md" wrap="wrap">
          <Text size="xs">
            💰 cachê base{" "}
            <Text span fw={700}>
              {type.baseFee.toLocaleString("pt-BR")}
            </Text>
          </Text>
          <Text size="xs" c={affordable ? "dimmed" : "red"}>
            custo {type.cost.toLocaleString("pt-BR")}
          </Text>
        </Group>
        <Group gap="md" wrap="wrap">
          <Text size="xs" c="teal">
            +{type.baseFans.toLocaleString("pt-BR")} fãs base
          </Text>
          <Text size="xs" c="orange">
            −{type.wear.toFixed(2).replace(".", ",")} humor
          </Text>
          {type.ownFansMultiplier < 1 && (
            <Text size="xs" c="dimmed">
              público próprio reduzido
            </Text>
          )}
        </Group>

        <Button
          mt="xs"
          size="xs"
          leftSection={<IconMicrophone size={14} />}
          disabled={locked || playedThisTurn || !affordable}
          loading={loading}
          onClick={onPlay}
        >
          {locked
            ? `Precisa de fama ${type.minFameLevel}`
            : !affordable
              ? "Caixa insuficiente"
              : "Tocar a temporada"}
        </Button>
      </Stack>
    </Paper>
  );
}

/** One past season in the history list. */
function GigRow({ gig, label }: { gig: Gig; label: string }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <div>
        <Text size="sm" fw={600}>
          {GIG_EMOJI[gig.gigTypeId] ?? "🎤"} {label}
        </Text>
        <Text size="xs" c="dimmed">
          {formatPeriod(gig.playedAtYear)} · {performanceStars(gig.performance)}
        </Text>
      </div>
      <Group gap="md" wrap="nowrap">
        <Text size="sm" fw={600} c={gig.net >= 0 ? "teal" : "red"}>
          {gig.net >= 0 ? "+" : ""}
          {gig.net.toLocaleString("pt-BR")}
        </Text>
        <Text size="xs" c="dimmed">
          +{gig.fansGained.toLocaleString("pt-BR")} fãs
        </Text>
      </Group>
    </Group>
  );
}

/**
 * The road: the circuits the band can play this turn and the seasons it already
 * played. One season per turn (ADR-0016) — the money that keeps a small band
 * alive while a work is being recorded.
 */
export function GigsTab({ band }: { band: BandDetail }) {
  const { data: types } = useGigTypes();
  const { data: gigs } = useGigs(band.id);
  const play = usePlayGig(band.id);

  const playedThisTurn = (gigs ?? []).some(
    (gig) => gig.playedAtYear === band.currentYear,
  );
  const labelOf = (id: string) =>
    types?.find((type) => type.id === id)?.label ?? id;

  function handlePlay(type: GigType) {
    play.mutate(type.id, {
      onSuccess: (result) => {
        const gains = result.skillGains
          .map(
            (gain) =>
              `${gain.name} ${formatSkillLevel(gain.from)} → ${formatSkillLevel(gain.to)}`,
          )
          .join(", ");
        notifications.show({
          title: `${type.label} — ${performanceStars(result.gig.performance)}`,
          message:
            `Cachê ${result.gig.fee.toLocaleString("pt-BR")} − custos ${result.gig.cost.toLocaleString("pt-BR")} = ` +
            `${result.gig.net.toLocaleString("pt-BR")} · +${result.gig.fansGained.toLocaleString("pt-BR")} fãs · ` +
            `humor ${result.gig.happinessDelta > 0 ? "+" : ""}${result.gig.happinessDelta.toString().replace(".", ",")}` +
            (gains ? ` · Estrada: ${gains}` : ""),
          color: result.gig.happinessDelta >= 0 ? "teal" : "orange",
        });
      },
      onError: () =>
        notifications.show({
          color: "red",
          message: "Não foi possível tocar esta temporada.",
        }),
    });
  }

  return (
    <Stack gap="xl">
      <div>
        <Title order={4}>A estrada</Title>
        <Text size="sm" c="dimmed">
          Cada turno vale meio ano: a banda faz{" "}
          <Text span fw={700}>
            uma
          </Text>{" "}
          temporada por turno no circuito que escolher. O cachê depende de como
          vocês tocam — e a estrada cansa.
        </Text>
      </div>

      {playedThisTurn && (
        <Alert color="blue">
          A banda já cumpriu a temporada deste turno. Avance o tempo para subir
          no palco de novo.
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {(types ?? []).map((type) => (
          <GigCard
            key={type.id}
            type={type}
            fameLevel={band.fame.level}
            balance={band.balance}
            playedThisTurn={playedThisTurn}
            loading={play.isPending}
            onPlay={() => handlePlay(type)}
          />
        ))}
      </SimpleGrid>

      <div>
        <Title order={5} mb="sm">
          Temporadas anteriores
        </Title>
        {(gigs ?? []).length === 0 ? (
          <Card withBorder padding="xl">
            <Stack align="center" gap="xs">
              <IconMicrophone size={28} opacity={0.5} />
              <Text c="dimmed">A banda ainda não subiu num palco.</Text>
            </Stack>
          </Card>
        ) : (
          <Card withBorder padding="md">
            <Stack gap="sm">
              {(gigs ?? []).map((gig) => (
                <GigRow key={gig.id} gig={gig} label={labelOf(gig.gigTypeId)} />
              ))}
            </Stack>
          </Card>
        )}
      </div>
    </Stack>
  );
}
