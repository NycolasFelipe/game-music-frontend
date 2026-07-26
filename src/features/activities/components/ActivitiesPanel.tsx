import {
  Avatar,
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
import { IconConfetti } from "@tabler/icons-react";
import { useState } from "react";
import {
  useActivityOptions,
  useBandActivities,
  useHoldActivity,
} from "@/features/activities/hooks/useActivities";
import type { ActivityOption } from "@/features/activities/types";
import type { BandDetail } from "@/features/bands";
import { formatPeriod } from "@/utils/period";

/** How a composed risk reads to the player — no percentages on the table. */
function riskBadge(chance: number): { label: string; color: string } {
  if (chance >= 0.4) return { label: "🔴 risco alto", color: "red" };
  if (chance >= 0.15) return { label: "🟡 risco médio", color: "yellow" };
  return { label: "🟢 risco baixo", color: "teal" };
}

/** One member on the guest list, in or out. */
function GuestToggle({
  name,
  avatar,
  going,
  onToggle,
}: {
  name: string;
  avatar?: string;
  going: boolean;
  onToggle: () => void;
}) {
  return (
    <Paper
      withBorder
      radius="xl"
      px="sm"
      py={6}
      role="checkbox"
      aria-checked={going}
      aria-label={`${going ? "Tirar" : "Levar"} ${name}`}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      style={{
        cursor: "pointer",
        borderColor: going ? "var(--mantine-color-blue-6)" : undefined,
        borderWidth: going ? 2 : 1,
        background: going ? "var(--mantine-color-blue-light)" : undefined,
      }}
    >
      <Group gap={6} wrap="nowrap">
        <Avatar size={22} radius="xl">
          {avatar ?? "🧑"}
        </Avatar>
        <Text size="sm" fw={going ? 700 : 400}>
          {name}
        </Text>
      </Group>
    </Paper>
  );
}

/**
 * Spending cash on the cast (ADR-0017). The guest list is the decision: the
 * effect only reaches who went, so taking the two who cannot stand each other
 * is both the only way to mend that bond and the likeliest way to blow it up.
 */
export function ActivitiesPanel({ band }: { band: BandDetail }) {
  const { data: options } = useActivityOptions(band.id);
  const { data: history } = useBandActivities(band.id);
  const hold = useHoldActivity(band.id);
  const [guests, setGuests] = useState<string[]>([]);

  const memberName = (id: string) =>
    band.members.find((member) => member.id === id)?.name ?? "alguém";

  function toggleGuest(id: string) {
    setGuests((current) =>
      current.includes(id)
        ? current.filter((guest) => guest !== id)
        : [...current, id],
    );
  }

  /** The lowest relationship level among the chosen guests, if any. */
  const worstLevel = band.relationships
    .filter(
      (relationship) =>
        guests.includes(relationship.memberAId) &&
        guests.includes(relationship.memberBId),
    )
    .reduce<number | null>(
      (worst, relationship) =>
        worst === null || relationship.level < worst ? relationship.level : worst,
      null,
    );

  function costOf(activity: ActivityOption): number | null {
    return (
      activity.costs.find((entry) => entry.participants === guests.length)
        ?.cost ?? null
    );
  }

  function riskOf(activity: ActivityOption): number {
    const hostility = worstLevel === null ? 0 : Math.max(0, -worstLevel);
    return Math.min(
      options?.troubleChanceMax ?? 1,
      activity.troubleChance + hostility * (options?.hostilityRisk ?? 0),
    );
  }

  function handleHold(activity: ActivityOption) {
    hold.mutate(
      { activityId: activity.id, participantIds: guests },
      {
        onSuccess: (result) => {
          const mended = result.relationshipChanges
            .filter((change) => change.to !== change.from)
            .map(
              (change) =>
                `${memberName(change.memberAId)} × ${memberName(change.memberBId)} ${change.from} → ${change.to}`,
            )
            .join(", ");
          notifications.show({
            title: result.trouble
              ? `${activity.emoji} ${activity.label} — e a noite virou`
              : `${activity.emoji} ${activity.label}`,
            message:
              `Custou ${result.activity.cost.toLocaleString("pt-BR")} · humor ${result.activity.happinessDelta > 0 ? "+" : ""}${result.activity.happinessDelta.toString().replace(".", ",")}` +
              (mended ? ` · ${mended}` : "") +
              (result.trouble ? " · Uma decisão apareceu." : ""),
            color: result.trouble ? "orange" : "teal",
          });
          setGuests([]);
        },
        onError: () =>
          notifications.show({
            color: "red",
            message: "Não foi possível marcar esta confraternização.",
          }),
      },
    );
  }

  return (
    <Stack gap="md">
      <div>
        <Title order={5}>Confraternizações</Title>
        <Text size="sm" c="dimmed">
          O efeito alcança <Text span fw={700}>só quem vai</Text> — leve os dois
          que não se falam e é a relação deles que melhora. Ou que explode.
        </Text>
      </div>

      <div>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>
          Quem vai ({guests.length})
        </Text>
        <Group gap="xs">
          {band.members.map((member) => (
            <GuestToggle
              key={member.id}
              name={member.name}
              avatar={member.avatar}
              going={guests.includes(member.id)}
              onToggle={() => toggleGuest(member.id)}
            />
          ))}
        </Group>
        {worstLevel !== null && worstLevel < 0 && (
          <Text size="xs" c="orange" mt={6}>
            Tem gente na lista que não se suporta — o que mais compensa e o que
            mais arrisca.
          </Text>
        )}
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {(options?.activities ?? []).map((activity) => {
          const cost = costOf(activity);
          const fits =
            guests.length >= activity.minParticipants &&
            guests.length <= activity.maxParticipants;
          const affordable = cost !== null && band.balance >= cost;
          const risk = riskBadge(riskOf(activity));

          return (
            <Paper key={activity.id} withBorder radius="md" p="md">
              <Stack gap={6} h="100%">
                <Group gap={8} wrap="nowrap" justify="space-between">
                  <Group gap={8} wrap="nowrap">
                    <Text fz={24} lh={1}>
                      {activity.emoji}
                    </Text>
                    <Text fw={700}>{activity.label}</Text>
                  </Group>
                  <Badge color={risk.color} variant="light" size="sm">
                    {risk.label}
                  </Badge>
                </Group>

                <Text size="xs" c="dimmed" lh={1.35} style={{ flex: 1 }}>
                  {activity.description}
                </Text>

                <Group gap="md" wrap="wrap">
                  <Text size="xs" c="teal">
                    +{activity.happinessGain.toString().replace(".", ",")} humor
                  </Text>
                  <Text size="xs" c="grape">
                    +{activity.relationshipGain} relação
                  </Text>
                  <Text size="xs" c="dimmed">
                    {activity.minParticipants}–{activity.maxParticipants} pessoas
                  </Text>
                </Group>

                <Button
                  mt="xs"
                  size="xs"
                  leftSection={<IconConfetti size={14} />}
                  disabled={!fits || !affordable}
                  loading={hold.isPending}
                  onClick={() => handleHold(activity)}
                >
                  {!fits
                    ? `Leve ${activity.minParticipants}–${activity.maxParticipants}`
                    : !affordable
                      ? "Caixa insuficiente"
                      : `Marcar · ${cost?.toLocaleString("pt-BR")}`}
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>

      {(history ?? []).length > 0 && (
        <Card withBorder padding="md">
          <Stack gap="xs">
            {(history ?? []).slice(0, 6).map((held) => (
              <Group key={held.id} justify="space-between" wrap="nowrap">
                <Text size="sm">
                  {(options?.activities ?? []).find(
                    (activity) => activity.id === held.activityId,
                  )?.label ?? held.activityId}{" "}
                  <Text span size="xs" c="dimmed">
                    {formatPeriod(held.heldAtYear)} ·{" "}
                    {held.participantIds.map(memberName).join(", ")}
                  </Text>
                </Text>
                <Group gap="sm" wrap="nowrap">
                  {held.trouble && (
                    <Badge size="xs" color="orange" variant="light">
                      deu treta
                    </Badge>
                  )}
                  <Text size="sm" c="red">
                    −{held.cost.toLocaleString("pt-BR")}
                  </Text>
                </Group>
              </Group>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
