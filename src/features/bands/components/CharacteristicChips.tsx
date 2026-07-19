import { Badge, Group, Tooltip } from "@mantine/core";
import type { Characteristic } from "@/features/bands/types";

/** Badge color per trait rarity (mirrors the original game). */
const RARITY_COLORS: Record<string, string> = {
  common: "gray",
  uncommon: "green",
  rare: "blue",
  legendary: "violet",
};

/**
 * Renders characteristic ids as labelled chips, using the backend catalog for
 * names/descriptions (falls back to the id while the catalog loads).
 */
export function CharacteristicChips({
  ids,
  catalog,
}: {
  ids: string[];
  catalog: Map<string, Characteristic>;
}) {
  return (
    <Group gap={4}>
      {ids.map((id) => {
        const trait = catalog.get(id);
        return (
          <Tooltip
            key={id}
            label={trait?.description ?? id}
            multiline
            w={240}
            withArrow
            events={{ hover: true, focus: true, touch: true }}
          >
            <Badge
              variant="light"
              color={RARITY_COLORS[trait?.rarity ?? "common"] ?? "gray"}
              style={{ cursor: "help" }}
            >
              {trait?.name ?? id}
            </Badge>
          </Tooltip>
        );
      })}
    </Group>
  );
}
