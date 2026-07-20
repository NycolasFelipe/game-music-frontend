import { Badge, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { SmartTooltip } from "@/components/SmartTooltip";
import {
  buildLookups,
  firstName,
  levelColor,
  pairKey,
  type RelationshipsViewProps,
} from "@/features/bands/components/relationship-utils";

/**
 * One panel per member listing how they relate to each other member (each
 * relationship appears under both members).
 */
export function RelationshipCards({
  members,
  relationships,
  levels,
}: RelationshipsViewProps) {
  const { levelByPair, infoByLevel } = buildLookups(relationships, levels);

  if (members.length < 2) {
    return (
      <Text size="sm" c="dimmed">
        Relacionamentos aparecem quando a banda tem 2 ou mais integrantes.
      </Text>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      {members.map((member) => (
        <Paper key={member.id} withBorder p="md" radius="md">
          <Group gap="sm" mb="sm" wrap="nowrap">
            <Text fz={26}>{member.avatar}</Text>
            <Text fw={600} truncate>
              {member.name}
            </Text>
          </Group>

          <Stack gap={6}>
            {members
              .filter((other) => other.id !== member.id)
              .map((other) => {
                const level = levelByPair.get(pairKey(member.id, other.id));
                const info =
                  level === undefined ? undefined : infoByLevel.get(level);

                return (
                  <Group
                    key={other.id}
                    justify="space-between"
                    wrap="nowrap"
                    gap="sm"
                  >
                    <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                      <Text fz={18}>{other.avatar}</Text>
                      <Text size="sm" truncate>
                        {firstName(other.name)}
                      </Text>
                    </Group>
                    <SmartTooltip
                      label={info?.description ?? ""}
                      disabled={!info}
                      multiline
                      w={260}
                      withArrow
                    >
                      <Badge
                        variant="light"
                        color={levelColor(level ?? 0)}
                        style={{ cursor: "help", flexShrink: 0 }}
                      >
                        {info ? `${info.emoji} ${info.name}` : `Nível ${level}`}
                      </Badge>
                    </SmartTooltip>
                  </Group>
                );
              })}
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
