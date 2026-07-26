import { Badge, Group, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconAlertTriangle, IconStarFilled } from "@tabler/icons-react";
import { formatSkillLevel, SKILL_LABELS, SKILL_ORDER } from "@/features/bands";
import type { BandMember, Skills } from "@/features/bands";
import {
  bestMemberFor,
  importanceStars,
} from "@/features/releases/creation-forecast";
import type { ReleaseCredits } from "@/features/releases/types";

/** Emoji per aspect — the studio-desk look, no icon imports needed. */
const ASPECT_EMOJI: Record<keyof Skills, string> = {
  vocal: "🎤",
  guitar: "🎸",
  bass: "🎻",
  drums: "🥁",
  piano: "🎹",
  lyrics: "✍️",
};

/** Color for a skill level, so a weak pick reads as weak at a glance. */
function skillColor(level: number): string {
  if (level >= 7) return "teal";
  if (level >= 4) return "blue";
  if (level >= 2) return "yellow";
  return "gray";
}

/** One member button inside an aspect row. */
function MemberChip({
  member,
  aspect,
  selected,
  best,
  onToggle,
}: {
  member: BandMember;
  aspect: keyof Skills;
  selected: boolean;
  best: boolean;
  onToggle: () => void;
}) {
  const level = member.skills[aspect];

  return (
    <UnstyledButton onClick={onToggle} aria-pressed={selected}>
      <Badge
        size="lg"
        variant={selected ? "filled" : "light"}
        color={selected ? skillColor(level) : "gray"}
        style={{ cursor: "pointer", textTransform: "none" }}
        leftSection={
          best ? (
            <IconStarFilled
              size={10}
              aria-label="Melhor da banda neste aspecto"
            />
          ) : undefined
        }
        rightSection={
          <Text span size="xs" fw={700}>
            {formatSkillLevel(level)}
          </Text>
        }
      >
        {member.name}
      </Badge>
    </UnstyledButton>
  );
}

/**
 * Assigns members to each aspect of a work, as a studio desk: aspects are
 * ordered by how much the chosen style depends on them, each showing its
 * importance and every member's level in it. Clicking a member toggles the
 * credit — one aspect takes several members, and a member takes several
 * aspects.
 */
export function CreditsEditor({
  members,
  value,
  onChange,
  weights,
}: {
  members: BandMember[];
  value: ReleaseCredits;
  onChange: (next: ReleaseCredits) => void;
  /** The style's per-aspect weights; when absent, the canonical order is used. */
  weights?: Record<keyof Skills, number>;
}) {
  const aspects = weights
    ? [...SKILL_ORDER].sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0))
    : SKILL_ORDER;

  const toggle = (aspect: keyof Skills, memberId: string) => {
    const current = value[aspect] ?? [];
    const next = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];
    onChange({ ...value, [aspect]: next });
  };

  return (
    <Stack gap="xs">
      {aspects.map((aspect) => {
        const weight = weights?.[aspect] ?? 0;
        const stars = weights ? importanceStars(weight) : 0;
        const assigned = value[aspect] ?? [];
        const crucialAndEmpty = weight >= 0.2 && assigned.length === 0;
        const best = bestMemberFor(members, aspect);

        return (
          <Paper
            key={aspect}
            withBorder
            p="xs"
            radius="md"
            bg={crucialAndEmpty ? "var(--mantine-color-red-light)" : undefined}
          >
            <Group justify="space-between" gap="xs" wrap="nowrap" mb={6}>
              <Group gap={6} wrap="nowrap">
                <Text size="sm">{ASPECT_EMOJI[aspect]}</Text>
                <Text size="sm" fw={600}>
                  {SKILL_LABELS[aspect]}
                </Text>
                {weights && (
                  <Text size="xs" c="yellow.7" title="Peso no estilo escolhido">
                    {"★".repeat(stars)}
                    <Text span c="dimmed">
                      {"★".repeat(3 - stars)}
                    </Text>
                  </Text>
                )}
              </Group>
              {weights && (
                <Text size="xs" c="dimmed">
                  {Math.round(weight * 100)}% da nota
                </Text>
              )}
            </Group>

            <Group gap={6} wrap="wrap">
              {members.map((member) => (
                <MemberChip
                  key={member.id}
                  member={member}
                  aspect={aspect}
                  selected={assigned.includes(member.id)}
                  best={member.id === best}
                  onToggle={() => toggle(aspect, member.id)}
                />
              ))}
            </Group>

            {crucialAndEmpty && (
              <Group gap={4} mt={6} wrap="nowrap">
                <IconAlertTriangle size={13} color="var(--mantine-color-red-7)" />
                <Text size="xs" c="red">
                  Aspecto decisivo para este estilo e ninguém assumiu.
                </Text>
              </Group>
            )}
          </Paper>
        );
      })}
    </Stack>
  );
}
