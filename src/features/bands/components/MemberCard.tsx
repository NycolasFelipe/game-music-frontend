import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { CharacteristicChips } from "@/features/bands/components/CharacteristicChips";
import { SkillBars } from "@/features/bands/components/SkillBars";
import { SKILL_LABELS } from "@/features/bands/labels";
import type { Characteristic, Skills } from "@/features/bands/types";

/** The shape shared by generated candidates and persisted members. */
export interface MemberCardData {
  name: string;
  age: number;
  gender: string;
  happiness?: number;
  primarySkill: string;
  skills: Skills;
  characteristics: string[];
  biography: string;
}

function genderLabel(gender: string): string {
  if (gender === "male") return "Masculino";
  if (gender === "female") return "Feminino";
  return gender;
}

/** Presentational card for a band member / candidate. */
export function MemberCard({
  member,
  catalog,
  selected,
  onToggle,
  actions,
}: {
  member: MemberCardData;
  catalog: Map<string, Characteristic>;
  selected?: boolean;
  onToggle?: () => void;
  actions?: ReactNode;
}) {
  const primaryLabel =
    SKILL_LABELS[member.primarySkill as keyof Skills] ?? member.primarySkill;

  return (
    <Card
      withBorder
      padding="md"
      onClick={onToggle}
      style={{
        cursor: onToggle ? "pointer" : undefined,
        borderColor: selected ? "var(--mantine-color-blue-5)" : undefined,
        borderWidth: selected ? 2 : undefined,
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text fw={600}>{member.name}</Text>
            <Text size="xs" c="dimmed">
              {member.age} anos · {genderLabel(member.gender)}
            </Text>
          </div>
          <Group gap="xs">
            <Badge>{primaryLabel}</Badge>
            {actions}
          </Group>
        </Group>

        <CharacteristicChips ids={member.characteristics} catalog={catalog} />

        <Text size="xs" c="dimmed">
          {member.biography}
        </Text>

        <SkillBars skills={member.skills} />
      </Stack>
    </Card>
  );
}
