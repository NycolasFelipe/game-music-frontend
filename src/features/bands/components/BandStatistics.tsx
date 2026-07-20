import { Box, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BandTrends } from "@/features/bands/components/BandTrends";
import { SKILL_LABELS, SKILL_ORDER } from "@/features/bands/labels";
import type { BandDetail, Skills } from "@/features/bands/types";
import { formatPeriod } from "@/utils/period";

/** Minimal turn-history point (a Turn is assignable to this). */
interface TurnPoint {
  year: number;
  period: string;
  fanCount: number;
  balance?: number | null;
  happinessAvg?: number | null;
  relationshipAvg?: number | null;
}

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fz={22} fw={700} lh={1.2} mt={4}>
        {value}
      </Text>
      {sub && (
        <Text size="xs" c="dimmed" truncate>
          {sub}
        </Text>
      )}
    </Paper>
  );
}

interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
}

function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <Paper withBorder shadow="sm" px="sm" py={6} radius="md">
      <Text size="xs" fw={600} mb={2}>
        {label}
      </Text>
      {payload.map((entry) => (
        <Text key={String(entry.dataKey)} size="xs" c="dimmed">
          {entry.name}:{" "}
          <Text span fw={600} c="var(--mantine-color-text)">
            {entry.value}
          </Text>
        </Text>
      ))}
    </Paper>
  );
}

const axisTick = { fill: "var(--mantine-color-dimmed)", fontSize: 11 };
const gridStroke = "var(--mantine-color-default-border)";

/** Statistics tab: headline tiles, time-series trends, and skill profile. */
export function BandStatistics({
  band,
  turns,
}: {
  band: BandDetail;
  turns: TurnPoint[];
}) {
  const happiness = band.members.map((m) => m.happiness);
  const ages = band.members.map((m) => m.age);
  const relationLevels = band.relationships.map((r) => r.level);

  const skillData = SKILL_ORDER.map((key: keyof Skills) => ({
    skill: SKILL_LABELS[key],
    value: Number(mean(band.members.map((m) => m.skills[key])).toFixed(1)),
  }));

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }}>
        <StatTile label="Fãs" value={band.fanCount.toLocaleString("pt-BR")} />
        <StatTile label="Caixa" value={band.balance.toLocaleString("pt-BR")} />
        <StatTile
          label="Fama"
          value={`Nível ${band.fame.level}`}
          sub={band.fame.title}
        />
        <StatTile label="Período" value={formatPeriod(band.currentYear)} />
        <StatTile
          label="Felicidade média"
          value={mean(happiness).toFixed(1)}
          sub="escala -5 a 5"
        />
        <StatTile label="Idade média" value={mean(ages).toFixed(0)} sub="anos" />
        <StatTile
          label="Relação média"
          value={relationLevels.length ? mean(relationLevels).toFixed(1) : "—"}
          sub="escala -5 a 5"
        />
      </SimpleGrid>

      <div>
        <Title order={5} mb="sm">
          Evolução ao longo do tempo
        </Title>
        <BandTrends turns={turns} />
      </div>

      <div>
        <Title order={5} mb="sm">
          Perfil de habilidades (média da banda)
        </Title>
        <Box h={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillData}
              layout="vertical"
              margin={{ top: 4, right: 32, bottom: 4, left: 8 }}
            >
              <CartesianGrid stroke={gridStroke} horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={axisTick} />
              <YAxis
                type="category"
                dataKey="skill"
                tick={axisTick}
                width={70}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fillOpacity: 0.08 }} />
              <Bar
                dataKey="value"
                name="Média"
                fill="var(--mantine-color-grape-6)"
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="value"
                  position="right"
                  fill="var(--mantine-color-dimmed)"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </div>
    </Stack>
  );
}
