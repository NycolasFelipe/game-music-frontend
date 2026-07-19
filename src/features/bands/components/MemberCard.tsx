import { Card, Group, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { CharacteristicChips } from "@/features/bands/components/CharacteristicChips";
import { SkillBars } from "@/features/bands/components/SkillBars";
import type { Characteristic, Skills } from "@/features/bands/types";

/** The shape shared by generated candidates and persisted members. */
export interface MemberCardData {
  name: string;
  age: number;
  gender: string;
  avatar: string;
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
          <Group gap="sm" wrap="nowrap" align="center">
            <Text fz={30} lh={1}>
              {member.avatar}
            </Text>
            <div>
              <Text fw={600}>{member.name}</Text>
              <Text size="xs" c="dimmed">
                {member.age} anos · {genderLabel(member.gender)}
              </Text>
            </div>
          </Group>
          {actions}
        </Group>

        <CharacteristicChips ids={member.characteristics} catalog={catalog} />

        <Text size="xs" c="dimmed">
          {member.biography}
        </Text>

        <SkillBars skills={member.skills} primarySkill={member.primarySkill} />
      </Stack>
    </Card>
  );
}
