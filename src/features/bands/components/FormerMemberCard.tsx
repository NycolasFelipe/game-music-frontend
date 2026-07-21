import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { CharacteristicChips } from "@/features/bands/components/CharacteristicChips";
import { HappinessBadge } from "@/features/bands/components/HappinessBadge";
import { SkillBars } from "@/features/bands/components/SkillBars";
import type { Characteristic } from "@/features/bands/types";
import type { FormerMember } from "@/types/former-member";

const DEPARTURE_REASONS: Record<string, string> = {
  salario_atrasado: "Salário atrasado",
};

function genderLabel(gender: string): string {
  if (gender === "male") return "Masculino";
  if (gender === "female") return "Feminino";
  return gender;
}

/**
 * Presentational card for a former (departed) member: their data at departure
 * plus why/when they left, turns unpaid, last salary and their relationships.
 */
export function FormerMemberCard({
  member,
  catalog,
}: {
  member: FormerMember;
  catalog: Map<string, Characteristic>;
}) {
  return (
    <Card withBorder padding="md">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
          <Group gap="sm" wrap="nowrap" align="center" style={{ flex: 1, minWidth: 0 }}>
            <Text fz={30} lh={1}>
              {member.avatar}
            </Text>
            <div style={{ minWidth: 0 }}>
              <Text fw={600} style={{ wordBreak: "break-word" }}>
                {member.name}
              </Text>
              <Text size="xs" c="dimmed">
                {member.age} anos · {genderLabel(member.gender)}
              </Text>
            </div>
          </Group>
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            <HappinessBadge value={member.happiness} />
            <Badge color="red" variant="light">
              Saiu · {member.leftAtYear}
            </Badge>
          </Group>
        </Group>

        <Text size="xs" c="dimmed">
          {DEPARTURE_REASONS[member.reason] ?? member.reason} ·{" "}
          {member.unpaidTurns} turno(s) sem receber · último salário{" "}
          {member.salary.toLocaleString("pt-BR")}
        </Text>

        <CharacteristicChips ids={member.characteristics} catalog={catalog} />

        <Text size="xs" c="dimmed">
          {member.biography}
        </Text>

        <SkillBars skills={member.skills} primarySkill={member.primarySkill} />

        {member.relationships.length > 0 && (
          <div>
            <Text size="xs" c="dimmed" fw={600} mb={4}>
              Relacionamentos
            </Text>
            <Stack gap={2}>
              {member.relationships.map((rel, index) => (
                <Group key={index} justify="space-between" gap="xs">
                  <Text size="xs">{rel.memberName}</Text>
                  <Badge
                    size="xs"
                    variant="light"
                    color={rel.level > 0 ? "teal" : rel.level < 0 ? "red" : "gray"}
                  >
                    {rel.level > 0 ? `+${rel.level}` : rel.level}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </Card>
  );
}
