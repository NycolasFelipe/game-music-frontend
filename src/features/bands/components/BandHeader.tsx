import {
  Badge,
  Divider,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { BandDetail } from "@/features/bands/types";
import { formatPeriod } from "@/utils/period";

/** One resource in the header strip: what it is, then how much of it there is. */
function HeaderStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Stack gap={0} miw={110}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lh={1.4}>
        {label}
      </Text>
      <Text fz={20} fw={700} lh={1.2} c={accent}>
        {value}
      </Text>
    </Stack>
  );
}

/**
 * The band's standing bar: who they are on one side, what they have on the
 * other, and the fame ladder underneath. Fame gets its own line because it is
 * the only figure that is a *position* rather than an amount — it says which
 * stages will book the band (ADR-0016) and how far the next rung is.
 */
export function BandHeader({
  band,
  themeLabel,
  originLabel,
}: {
  band: BandDetail;
  themeLabel: string;
  originLabel: string;
}) {
  const { fame } = band;
  const span =
    fame.nextLevelAtFans === null
      ? 0
      : fame.nextLevelAtFans - fame.currentLevelMinFans;
  const climbed = span > 0 ? band.fanCount - fame.currentLevelMinFans : 0;
  const progress = span > 0 ? Math.min(100, (climbed / span) * 100) : 100;
  const missing =
    fame.nextLevelAtFans === null ? 0 : fame.nextLevelAtFans - band.fanCount;

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Title order={2} lh={1.1}>
              {band.name}
            </Title>
            <Group gap={6}>
              <Badge variant="light" size="sm">
                {themeLabel}
              </Badge>
              <Badge variant="light" size="sm" color="gray">
                {originLabel}
              </Badge>
              <Text size="xs" c="dimmed">
                desde {band.foundationYear}
              </Text>
            </Group>
          </Stack>

          <Group gap="xl" wrap="wrap">
            <HeaderStat label="Período" value={formatPeriod(band.currentYear)} />
            <HeaderStat
              label="Fãs"
              value={band.fanCount.toLocaleString("pt-BR")}
            />
            <HeaderStat
              label="Caixa"
              value={band.balance.toLocaleString("pt-BR")}
              accent={band.balance < 0 ? "red" : "teal"}
            />
          </Group>
        </Group>

        <Divider />

        <Group gap="md" wrap="nowrap" align="center">
          <Badge size="lg" color="grape" variant="light">
            Nível {fame.level} · {fame.title}
          </Badge>
          <Stack gap={2} flex={1} miw={160}>
            <Text size="xs" c="dimmed">
              {fame.subtitle}
            </Text>
            <Progress value={progress} size="sm" radius="xl" color="grape" />
          </Stack>
          <Text size="xs" c="dimmed" ta="right" miw={130}>
            {fame.isMaxLevel
              ? "No topo da escada"
              : `faltam ${missing.toLocaleString("pt-BR")} fãs para o Nível ${fame.level + 1}`}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
