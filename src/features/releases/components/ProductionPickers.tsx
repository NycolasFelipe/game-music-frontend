import { Badge, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import type { BudgetTier, ReleaseFormat } from "@/features/releases/types";

/** Cover art per format — reads faster than a label in a dropdown. */
const FORMAT_EMOJI: Record<string, string> = {
  single: "💿",
  ep: "📀",
  lp: "🎶",
  album: "🏆",
  acoustic: "🪕",
  live: "🎪",
};

/** Studio vibe per budget tier. */
const BUDGET_EMOJI: Record<string, string> = {
  caseiro: "🛋️",
  estudio: "🎛️",
  grande: "🏛️",
};

/** A 0..1 ratio rendered as five pips — the game-y way to compare stats. */
function Pips({ value, color }: { value: number; color: string }) {
  const filled = Math.max(1, Math.min(5, Math.round(value * 5)));
  return (
    <Text size="xs" c={color} lh={1}>
      {"●".repeat(filled)}
      <Text span c="dimmed">
        {"●".repeat(5 - filled)}
      </Text>
    </Text>
  );
}

/** A selectable card shared by both pickers. */
function PickerCard({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      style={{
        cursor: "pointer",
        borderColor: selected ? "var(--mantine-color-blue-6)" : undefined,
        borderWidth: selected ? 2 : 1,
        background: selected ? "var(--mantine-color-blue-light)" : undefined,
        transition: "transform 120ms ease, background 120ms ease",
        transform: selected ? "translateY(-2px)" : undefined,
      }}
    >
      {children}
    </Paper>
  );
}

/**
 * Picks the release format as cards: tracks, cost, reach and how much the work
 * develops the band (ADR-0012) — the trade-off a dropdown was hiding.
 */
export function FormatPicker({
  formats,
  value,
  onChange,
}: {
  formats: ReleaseFormat[];
  value: string;
  onChange: (id: string) => void;
}) {
  const maxReach = Math.max(...formats.map((f) => f.baseReach), 1);
  const maxGain = Math.max(...formats.map((f) => f.skillGain), 1);

  return (
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs" role="radiogroup">
      {formats.map((format) => (
        <PickerCard
          key={format.id}
          selected={format.id === value}
          onSelect={() => onChange(format.id)}
        >
          <Stack gap={4}>
            <Group gap={6} wrap="nowrap">
              <Text>{FORMAT_EMOJI[format.id] ?? "💿"}</Text>
              <Text size="sm" fw={700}>
                {format.label}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {format.minTracks}–{format.maxTracks} faixas
            </Text>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" c="dimmed" w={54}>
                Alcance
              </Text>
              <Pips value={format.baseReach / maxReach} color="teal" />
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" c="dimmed" w={54}>
                Ensina
              </Text>
              <Pips value={format.skillGain / maxGain} color="grape" />
            </Group>
            <Text size="xs" c="dimmed">
              base {format.baseCost.toLocaleString("pt-BR")}
            </Text>
          </Stack>
        </PickerCard>
      ))}
    </SimpleGrid>
  );
}

/**
 * Picks the budget tier as cards, showing what the money buys (quality) and
 * what it costs, plus the resulting price for the chosen format.
 */
export function BudgetPicker({
  tiers,
  value,
  onChange,
  baseCost,
  balance,
}: {
  tiers: BudgetTier[];
  value: string;
  onChange: (id: string) => void;
  /** The chosen format's base cost, to price each tier. */
  baseCost: number | null;
  /** The band's cash, to flag the tiers it cannot afford. */
  balance: number;
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs" role="radiogroup">
      {tiers.map((tier) => {
        const cost =
          baseCost === null
            ? null
            : Math.round(baseCost * tier.costMultiplier * 100) / 100;
        const affordable = cost === null || cost <= balance;

        return (
          <PickerCard
            key={tier.id}
            selected={tier.id === value}
            onSelect={() => onChange(tier.id)}
          >
            <Stack gap={4}>
              <Group gap={6} wrap="nowrap" justify="space-between">
                <Group gap={6} wrap="nowrap">
                  <Text>{BUDGET_EMOJI[tier.id] ?? "🎛️"}</Text>
                  <Text size="sm" fw={700}>
                    {tier.label}
                  </Text>
                </Group>
                <Badge
                  size="sm"
                  variant="light"
                  color={tier.qualityMultiplier >= 1 ? "teal" : "gray"}
                >
                  {tier.qualityMultiplier >= 1 ? "+" : ""}
                  {Math.round((tier.qualityMultiplier - 1) * 100)}% nota
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" lh={1.3}>
                {tier.description}
              </Text>
              {cost !== null && (
                <Text size="xs" fw={600} c={affordable ? undefined : "red"}>
                  {cost.toLocaleString("pt-BR")}
                  {!affordable && " — não cabe no caixa"}
                </Text>
              )}
            </Stack>
          </PickerCard>
        );
      })}
    </SimpleGrid>
  );
}
