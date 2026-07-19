import { Group, Progress, Stack, Text } from "@mantine/core";
import {
  IconGuitarPick,
  IconMicrophone,
  IconMusic,
  IconPencil,
  IconPiano,
  IconStarFilled,
  type IconProps,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { SmartTooltip } from "@/components/SmartTooltip";
import { useSkillDescriptions } from "@/features/bands/hooks/useBandOptions";
import {
  SKILL_LABELS,
  SKILL_ORDER,
  skillLevelDescription,
} from "@/features/bands/labels";
import type { Skills } from "@/features/bands/types";

/** Instrument icon component per skill (mirrors the original game). */
const SKILL_ICONS: Record<keyof Skills, ComponentType<IconProps>> = {
  vocal: IconMicrophone,
  guitar: IconMusic,
  bass: IconGuitarPick,
  drums: IconMusic,
  piano: IconPiano,
  lyrics: IconPencil,
};

// `display:block` drops the inline-SVG baseline gap; the tiny upward nudge sits
// the icon on the text's optical center (its geometric center reads slightly
// low next to lowercase text).
const ALIGN_ICON = { display: "block", transform: "translateY(-1px)" } as const;

/**
 * Renders the six skills as labelled bars (skill scale is 0..10). The primary
 * skill is marked with a star; each row has a tooltip with the flavor
 * description for that skill's level.
 */
export function SkillBars({
  skills,
  primarySkill,
}: {
  skills: Skills;
  primarySkill?: string;
}) {
  const { data: descriptions } = useSkillDescriptions();

  return (
    <Stack gap={4}>
      {SKILL_ORDER.map((key) => {
        const Icon = SKILL_ICONS[key];
        return (
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
              <Group
                gap={4}
                wrap="nowrap"
                align="center"
                w={92}
                c="dimmed"
                style={{ flexShrink: 0 }}
              >
                <Icon size={14} style={ALIGN_ICON} />
                <Text size="xs" lh={1}>
                  {SKILL_LABELS[key]}
                </Text>
                {key === primarySkill && (
                  <IconStarFilled
                    size={11}
                    color="var(--mantine-color-yellow-6)"
                    style={ALIGN_ICON}
                    aria-label="Habilidade principal"
                  />
                )}
              </Group>
              <Progress value={(skills[key] / 10) * 100} size="sm" flex={1} />
              <Text size="xs" w={20} ta="right" lh={1}>
                {skills[key]}
              </Text>
            </Group>
          </SmartTooltip>
        );
      })}
    </Stack>
  );
}
