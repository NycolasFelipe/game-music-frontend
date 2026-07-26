import { Group, Paper, Progress, Stack, Text } from "@mantine/core";
import { qualityTierColor } from "@/features/releases/labels";
import type { QualityTier } from "@/features/releases/types";

/**
 * The producer's read on the draft: the quality the current line-up, mood and
 * budget are heading for, and the tier that lands on. An estimate on purpose —
 * the studio variance and the creation events only happen at launch.
 */
export function ForecastMeter({
  quality,
  tiers,
}: {
  quality: number;
  tiers: QualityTier[] | undefined;
}) {
  const tier = (tiers ?? [])
    .filter((candidate) => quality >= candidate.minQuality)
    .at(-1);
  const color = qualityTierColor(tier?.id ?? null);

  return (
    <Paper withBorder p="sm" radius="md">
      <Stack gap={6}>
        <Group justify="space-between" align="flex-end" wrap="nowrap">
          <div>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Prognóstico do produtor
            </Text>
            <Text size="xs" c="dimmed">
              antes da variância do estúdio e das decisões de criação
            </Text>
          </div>
          <Group gap={6} align="baseline" wrap="nowrap">
            <Text
              fw={900}
              c={color}
              style={{ fontSize: "1.6rem", lineHeight: 1 }}
            >
              {quality}
            </Text>
            {tier && (
              <Text size="sm" fw={700} c={color}>
                {tier.emoji} {tier.label}
              </Text>
            )}
          </Group>
        </Group>
        <Progress value={quality} color={color} size="lg" radius="xl" />
      </Stack>
    </Paper>
  );
}
