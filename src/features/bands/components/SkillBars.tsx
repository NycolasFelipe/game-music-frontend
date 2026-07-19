import { Group, Progress, Stack, Text } from "@mantine/core";
import { SmartTooltip } from "@/components/SmartTooltip";
import { useSkillDescriptions } from "@/features/bands/hooks/useBandOptions";
import {
  SKILL_LABELS,
  SKILL_ORDER,
  skillLevelDescription,
} from "@/features/bands/labels";
import type { Skills } from "@/features/bands/types";

/**
 * Renders the six skills as labelled bars (skill scale is 0..10). Each row has
 * a tooltip with the flavor description for that skill's level.
 */
export function SkillBars({ skills }: { skills: Skills }) {
  const { data: descriptions } = useSkillDescriptions();

  return (
    <Stack gap={4}>
      {SKILL_ORDER.map((key) => (
        <SmartTooltip
          key={key}
          label={skillLevelDescription(descriptions?.[key], skills[key])}
          disabled={!descriptions}
          multiline
          w={260}
          withArrow
          events={{ hover: true, focus: true, touch: true }}
        >
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" w={64}>
              {SKILL_LABELS[key]}
            </Text>
            <Progress value={(skills[key] / 10) * 100} size="sm" flex={1} />
            <Text size="xs" w={20} ta="right">
              {skills[key]}
            </Text>
          </Group>
        </SmartTooltip>
      ))}
    </Stack>
  );
}
