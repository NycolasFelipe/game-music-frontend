import { Badge, Group, Stack, Text } from "@mantine/core";
import { formatSkillLevel, SKILL_LABELS } from "@/features/bands";
import type {
  ReleaseMemberGrowth,
  ReleaseSkillGain,
} from "@/features/releases/types";

/** "Letras 4.2 → 4.6" for one developed aspect. */
function gainLabel(gain: ReleaseSkillGain): string {
  return `${SKILL_LABELS[gain.skill]} ${formatSkillLevel(gain.from)} → ${formatSkillLevel(gain.to)}`;
}

/** Signed happiness delta, e.g. "+0,5 humor". */
function happinessLabel(delta: number): string {
  const value = delta.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return `${delta > 0 ? "+" : ""}${value} humor`;
}

/** One member's row: the aspects they developed plus how the work felt. */
function MemberGrowthRow({
  entry,
  compact,
}: {
  entry: ReleaseMemberGrowth;
  compact: boolean;
}) {
  return (
    <Group gap={6} wrap="wrap" justify={compact ? "flex-start" : "center"}>
      <Text size="sm" fw={600}>
        {entry.name}
      </Text>
      {entry.gains.map((gain) => (
        <Badge
          key={gain.skill}
          size="sm"
          variant={gain.leveledUp ? "filled" : "light"}
          color={gain.leveledUp ? "yellow" : "teal"}
        >
          {gainLabel(gain)}
          {gain.leveledUp ? ` · nível ${Math.floor(gain.to)}!` : ""}
        </Badge>
      ))}
      {entry.happinessDelta !== 0 && (
        <Text size="xs" c={entry.happinessDelta > 0 ? "teal" : "red"}>
          {happinessLabel(entry.happinessDelta)}
        </Text>
      )}
    </Group>
  );
}

/**
 * What a work developed in the members credited on it (ADR-0012). Renders
 * nothing when the work predates the feature or nobody grew.
 */
export function ReleaseGrowthList({
  growth,
  compact = false,
}: {
  growth: ReleaseMemberGrowth[] | undefined;
  compact?: boolean;
}) {
  const entries = (growth ?? []).filter(
    (entry) => entry.gains.length > 0 || entry.happinessDelta !== 0,
  );
  if (entries.length === 0) {
    return null;
  }

  return (
    <Stack gap={compact ? 2 : "xs"}>
      {entries.map((entry) => (
        <MemberGrowthRow
          key={entry.memberId}
          entry={entry}
          compact={compact}
        />
      ))}
    </Stack>
  );
}
