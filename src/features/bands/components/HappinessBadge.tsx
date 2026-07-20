import { Badge } from "@mantine/core";
import { SmartTooltip } from "@/components/SmartTooltip";
import { useHappinessLevels } from "@/features/bands/hooks/useBandOptions";

/** Badge color by happiness value (ported from the original). */
function happinessColor(value: number): string {
  if (value >= 4) return "pink";
  if (value >= 2) return "green";
  if (value >= 1) return "blue";
  if (value > -1 && value < 1) return "gray";
  if (value >= -2) return "yellow";
  return "red";
}

/**
 * Shows a member's mood: the happiness value bucketed to its level, with the
 * backend emoji/name and a tooltip description.
 */
export function HappinessBadge({
  value,
  size = "sm",
}: {
  value: number;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const { data: levels } = useHappinessLevels();
  const bucket = Math.max(
    -5,
    Math.min(5, Math.round(Number.isFinite(value) ? value : 0)),
  );
  const info = levels?.find((l) => l.level === bucket);

  return (
    <SmartTooltip
      label={info?.description ?? ""}
      disabled={!info}
      multiline
      w={260}
      withArrow
    >
      <Badge
        variant="light"
        color={happinessColor(value)}
        size={size}
        style={{ cursor: "help", flexShrink: 0 }}
      >
        {info ? `${info.emoji} ${info.name}` : `Humor ${value}`}
      </Badge>
    </SmartTooltip>
  );
}
