import { Group, Progress, Stack, Text } from "@mantine/core";
import { SKILL_LABELS, SKILL_ORDER } from "@/features/bands/labels";
import type { Skills } from "@/features/bands/types";

/** Renders the six skills as labelled bars (skill scale is 0..10). */
export function SkillBars({ skills }: { skills: Skills }) {
  return (
    <Stack gap={4}>
      {SKILL_ORDER.map((key) => (
        <Group key={key} gap="xs" wrap="nowrap">
          <Text size="xs" w={64}>
            {SKILL_LABELS[key]}
          </Text>
          <Progress value={(skills[key] / 10) * 100} size="sm" flex={1} />
          <Text size="xs" w={20} ta="right">
            {skills[key]}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}
