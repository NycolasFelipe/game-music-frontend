import { Badge, Button, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { IconBolt } from "@tabler/icons-react";
import { MemberHoverName } from "@/features/bands";
import type { BandMember, Characteristic } from "@/features/bands";
import type { ActiveEvent } from "@/features/events/types";

/**
 * One band decision, with its options as full-width choices. Presentational —
 * the caller owns the mutation, so the same card serves wherever a pending
 * decision needs answering.
 */
export function ActiveEventDecision({
  event,
  members,
  catalog,
  pending,
  onChoose,
}: {
  event: ActiveEvent;
  /** The band's members, to name the ones the event involves. */
  members: BandMember[];
  catalog: Map<string, Characteristic>;
  /** True while the choice is being applied. */
  pending: boolean;
  onChoose: (optionId: string) => void;
}) {
  const memberById = new Map(members.map((member) => [member.id, member]));
  const involved = event.involvedCharacterIds
    .map((id) => memberById.get(id))
    .filter((member): member is BandMember => Boolean(member));

  return (
    <Stack gap="sm">
      <Badge color="yellow" leftSection={<IconBolt size={12} />} w="fit-content">
        Decisão pendente
      </Badge>
      <Title order={4}>{event.title}</Title>
      <Text size="sm">{event.description}</Text>

      {involved.length > 0 && (
        <Group gap="lg">
          <Text size="xs" c="dimmed" fw={600}>
            Envolvidos:
          </Text>
          {involved.map((member) => (
            <MemberHoverName key={member.id} member={member} catalog={catalog} />
          ))}
        </Group>
      )}

      <Stack gap="xs" mt="xs">
        {event.options.map((option) => (
          <Button
            key={option.id}
            variant="default"
            fullWidth
            justify="flex-start"
            h="auto"
            py="sm"
            onClick={() => onChoose(option.id)}
            disabled={pending}
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

      {pending && (
        <Group gap="xs">
          <Loader size="xs" />
          <Text size="xs" c="dimmed">
            Aplicando consequências…
          </Text>
        </Group>
      )}
    </Stack>
  );
}
