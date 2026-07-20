import { Box, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SKILL_LABELS, SKILL_ORDER } from "@/features/bands/labels";
import type { BandDetail, Skills } from "@/features/bands/types";
import { formatPeriod } from "@/utils/period";

/** Minimal fan-history point (a Turn is assignable to this). */
interface TurnPoint {
  year: number;
  period: string;
  fanCount: number;
}

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

const compactYear = (year: number) =>
  `${Math.floor(year)}${year % 1 ? "½" : ""}`;

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
  payload?: Record<string, unknown>;
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

/** Statistics tab: headline tiles, fan growth over time, and skill profile. */
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

  const fanData = turns.map((t) => ({
    label: compactYear(t.year),
    period: t.period,
    fans: t.fanCount,
  }));

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }}>
        <StatTile label="Fãs" value={band.fanCount.toLocaleString("pt-BR")} />
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
          Evolução de fãs
        </Title>
        {fanData.length >= 1 ? (
          <Box h={240}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={fanData}
                margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
              >
                <defs>
                  <linearGradient id="fansFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--mantine-color-teal-6)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--mantine-color-teal-6)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickMargin={8} />
                <YAxis
                  tick={axisTick}
                  width={44}
                  allowDecimals={false}
                  tickFormatter={(v: number) => v.toLocaleString("pt-BR")}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  labelFormatter={(_label, payload) =>
                    (payload?.[0]?.payload as { period?: string })?.period ??
                    _label
                  }
                  cursor={{ stroke: gridStroke }}
                />
                <Area
                  type="monotone"
                  dataKey="fans"
                  name="Fãs"
                  stroke="var(--mantine-color-teal-6)"
                  strokeWidth={2}
                  fill="url(#fansFill)"
                  dot={fanData.length <= 12}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Text size="sm" c="dimmed">
            Avance turnos para acompanhar a evolução dos fãs.
          </Text>
        )}
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
