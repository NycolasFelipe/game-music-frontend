import { Box, Chip, Group, Paper, Stack, Switch, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Minimal turn-history point (a Turn is assignable to this). */
interface TurnPoint {
  year: number;
  period: string;
  fanCount: number;
  balance?: number | null;
  happinessAvg?: number | null;
  relationshipAvg?: number | null;
}

type MetricId = "fans" | "money" | "climate";

const compactYear = (year: number) =>
  `${Math.floor(year)}${year % 1 ? "½" : ""}`;
const round1 = (v: number) => Math.round(v * 10) / 10;
const axisTick = { fill: "var(--mantine-color-dimmed)", fontSize: 11 };
const gridStroke = "var(--mantine-color-default-border)";

const COLORS = {
  fans: "var(--mantine-color-teal-6)",
  money: "var(--mantine-color-lime-6)",
  humor: "var(--mantine-color-pink-6)",
  relacao: "var(--mantine-color-violet-6)",
};

interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

/** Tooltip that reads a series' raw value from the datum (`<key>Raw`). */
function TrendTooltip({
  active,
  label,
  payload,
  normalized,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  normalized?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const period = (payload[0]?.payload as { period?: string })?.period ?? label;
  return (
    <Paper withBorder shadow="sm" px="sm" py={6} radius="md">
      <Text size="xs" fw={600} mb={2}>
        {period}
      </Text>
      {payload.map((entry) => {
        const raw = normalized
          ? (entry.payload?.[`${String(entry.dataKey)}Raw`] as
              | number
              | null
              | undefined)
          : (entry.value as number | undefined);
        return (
          <Text key={String(entry.dataKey)} size="xs" c="dimmed">
            {entry.name}:{" "}
            <Text span fw={600} c="var(--mantine-color-text)">
              {raw == null ? "—" : raw.toLocaleString("pt-BR")}
            </Text>
          </Text>
        );
      })}
    </Paper>
  );
}

const norm5 = (v: number) => ((v + 5) / 10) * 100;

/**
 * The band's time-series trends (fans, cash and climate). Metrics can be toggled
 * on/off and either overlaid on one normalized chart or shown as separate
 * charts. Choices persist to localStorage.
 */
export function BandTrends({ turns }: { turns: TurnPoint[] }) {
  const [metrics, setMetrics] = useLocalStorage<MetricId[]>({
    key: "gm-stats-metrics",
    defaultValue: ["fans", "money", "climate"],
  });
  const [overlay, setOverlay] = useLocalStorage<boolean>({
    key: "gm-stats-overlay",
    defaultValue: false,
  });

  const show = (m: MetricId) => metrics.includes(m);

  const fanData = turns.map((t) => ({
    label: compactYear(t.year),
    period: t.period,
    fans: t.fanCount,
  }));
  const moneyData = turns
    .filter((t): t is TurnPoint & { balance: number } => t.balance != null)
    .map((t) => ({
      label: compactYear(t.year),
      period: t.period,
      balance: t.balance,
    }));
  const climateData = turns
    .filter((t) => t.happinessAvg != null || t.relationshipAvg != null)
    .map((t) => ({
      label: compactYear(t.year),
      period: t.period,
      humor: t.happinessAvg,
      relacao: t.relationshipAvg,
    }));

  const maxFans = Math.max(1, ...turns.map((t) => t.fanCount ?? 0));
  const maxMoney = Math.max(1, ...turns.map((t) => t.balance ?? 0));
  const combinedData = turns.map((t) => ({
    label: compactYear(t.year),
    period: t.period,
    fans: round1((t.fanCount / maxFans) * 100),
    fansRaw: t.fanCount,
    money: t.balance != null ? round1((t.balance / maxMoney) * 100) : null,
    moneyRaw: t.balance ?? null,
    humor: t.happinessAvg != null ? round1(norm5(t.happinessAvg)) : null,
    humorRaw: t.happinessAvg ?? null,
    relacao:
      t.relationshipAvg != null ? round1(norm5(t.relationshipAvg)) : null,
    relacaoRaw: t.relationshipAvg ?? null,
  }));

  const controls = (
    <Group justify="space-between" wrap="wrap">
      <Chip.Group
        multiple
        value={metrics}
        onChange={(v) => setMetrics(v as MetricId[])}
      >
        <Group gap="xs">
          <Chip value="fans" size="xs" color="teal">
            Fãs
          </Chip>
          <Chip value="money" size="xs" color="lime">
            Caixa
          </Chip>
          <Chip value="climate" size="xs" color="grape">
            Clima
          </Chip>
        </Group>
      </Chip.Group>
      <Switch
        label="Sobrepor"
        checked={overlay}
        onChange={(e) => setOverlay(e.currentTarget.checked)}
      />
    </Group>
  );

  if (metrics.length === 0) {
    return (
      <Stack gap="sm">
        {controls}
        <Text size="sm" c="dimmed">
          Selecione ao menos uma métrica.
        </Text>
      </Stack>
    );
  }

  if (turns.length === 0) {
    return (
      <Stack gap="sm">
        {controls}
        <Text size="sm" c="dimmed">
          Avance turnos para acompanhar a evolução da banda.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {controls}

      {overlay ? (
        <div>
          <Text size="xs" c="dimmed" mb="xs">
            Valores normalizados (0–100, relativos ao pico de cada série). Passe o
            mouse para ver os valores reais.
          </Text>
          <Box h={260}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedData}
                margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
              >
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickMargin={8} />
                <YAxis domain={[0, 100]} tick={axisTick} width={32} />
                <Tooltip
                  content={<TrendTooltip normalized />}
                  cursor={{ stroke: gridStroke }}
                />
                <Legend />
                {show("fans") && (
                  <Line
                    type="monotone"
                    dataKey="fans"
                    name="Fãs"
                    stroke={COLORS.fans}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                )}
                {show("money") && (
                  <Line
                    type="monotone"
                    dataKey="money"
                    name="Caixa"
                    stroke={COLORS.money}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                )}
                {show("climate") && (
                  <Line
                    type="monotone"
                    dataKey="humor"
                    name="Humor"
                    stroke={COLORS.humor}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                )}
                {show("climate") && (
                  <Line
                    type="monotone"
                    dataKey="relacao"
                    name="Relação"
                    stroke={COLORS.relacao}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </div>
      ) : (
        <Stack gap="lg">
          {show("fans") && (
            <TrendBlock title="Evolução de fãs" hasData={fanData.length >= 1}>
              <AreaChart
                data={fanData}
                margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
              >
                <defs>
                  <linearGradient id="fansFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.fans} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.fans} stopOpacity={0.02} />
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
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: gridStroke }} />
                <Area
                  type="monotone"
                  dataKey="fans"
                  name="Fãs"
                  stroke={COLORS.fans}
                  strokeWidth={2}
                  fill="url(#fansFill)"
                  dot={fanData.length <= 12}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </TrendBlock>
          )}

          {show("money") && (
            <TrendBlock
              title="Evolução do caixa"
              hasData={moneyData.length >= 1}
            >
              <AreaChart
                data={moneyData}
                margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
              >
                <defs>
                  <linearGradient id="moneyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.money} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.money} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickMargin={8} />
                <YAxis
                  tick={axisTick}
                  width={56}
                  tickFormatter={(v: number) => v.toLocaleString("pt-BR")}
                />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: gridStroke }} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Caixa"
                  stroke={COLORS.money}
                  strokeWidth={2}
                  fill="url(#moneyFill)"
                  dot={moneyData.length <= 12}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </TrendBlock>
          )}

          {show("climate") && (
            <TrendBlock
              title="Clima da banda (humor e relação médios)"
              hasData={climateData.length >= 1}
            >
              <LineChart
                data={climateData}
                margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
              >
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickMargin={8} />
                <YAxis domain={[-5, 5]} tick={axisTick} width={32} />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: gridStroke }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="humor"
                  name="Humor"
                  stroke={COLORS.humor}
                  strokeWidth={2}
                  dot={climateData.length <= 12}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="relacao"
                  name="Relação"
                  stroke={COLORS.relacao}
                  strokeWidth={2}
                  dot={climateData.length <= 12}
                  connectNulls
                />
              </LineChart>
            </TrendBlock>
          )}
        </Stack>
      )}
    </Stack>
  );
}

/** A titled chart block with an empty-state fallback. */
function TrendBlock({
  title,
  hasData,
  children,
}: {
  title: string;
  hasData: boolean;
  children: React.ReactElement;
}) {
  return (
    <div>
      <Text fw={600} size="sm" mb="xs">
        {title}
      </Text>
      {hasData ? (
        <Box h={240}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </Box>
      ) : (
        <Text size="sm" c="dimmed">
          Avance turnos para acompanhar esta métrica.
        </Text>
      )}
    </div>
  );
}
