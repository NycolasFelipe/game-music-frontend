import { ActionIcon, Box, Card, Group, Loader, Stack, Text, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconRefresh } from "@tabler/icons-react";
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

/**
 * The member avatar. When `onRegenerate` is provided, hovering fades the emoji
 * and reveals a regenerate button (used for editable candidates).
 */
function MemberAvatar({
  avatar,
  onRegenerate,
  loading,
}: {
  avatar: string;
  onRegenerate?: () => void;
  loading?: boolean;
}) {
  const { hovered, ref } = useHover();

  if (!onRegenerate) {
    return (
      <Text fz={30} lh={1}>
        {avatar}
      </Text>
    );
  }

  const active = hovered || loading;

  return (
    <Box
      ref={ref}
      pos="relative"
      style={{ cursor: "pointer", lineHeight: 0 }}
      onClick={(event) => {
        event.stopPropagation();
        if (!loading) onRegenerate();
      }}
    >
      <Text
        fz={30}
        lh={1}
        style={{ opacity: active ? 0.2 : 1, transition: "opacity 120ms" }}
      >
        {avatar}
      </Text>
      {active && (
        <Box
          pos="absolute"
          inset={0}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <Loader size="xs" />
          ) : (
            <Tooltip label="Regerar aparência" withArrow>
              <ActionIcon component="div" variant="light" size="sm" radius="xl">
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}

/** Presentational card for a band member / candidate. */
export function MemberCard({
  member,
  catalog,
  selected,
  onToggle,
  actions,
  onRegenerateAvatar,
  avatarRegenerating,
}: {
  member: MemberCardData;
  catalog: Map<string, Characteristic>;
  selected?: boolean;
  onToggle?: () => void;
  actions?: ReactNode;
  onRegenerateAvatar?: () => void;
  avatarRegenerating?: boolean;
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
            <MemberAvatar
              avatar={member.avatar}
              onRegenerate={onRegenerateAvatar}
              loading={avatarRegenerating}
            />
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
