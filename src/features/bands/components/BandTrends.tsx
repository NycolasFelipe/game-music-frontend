import { Box, Chip, Group, Stack, Switch, Text } from "@mantine/core";
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
import { tone } from "@/components/halftone";
import { formatMoney } from "@/utils/money";

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
const axisTick = { fill: "var(--rv-soft)", fontSize: 11, fontFamily: "var(--rv-mono)" };
const gridStroke = "var(--rv-soft)";

const COLORS = {
  fans: "var(--rv-ink)",
  money: "var(--rv-ink)",
  humor: "var(--rv-red)",
  relacao: "var(--rv-soft)",
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
    <div className="rv-chart-tip">
      <div className="rv-chart-tip-head">{period}</div>
      {payload.map((entry) => {
        const raw = normalized
          ? (entry.payload?.[`${String(entry.dataKey)}Raw`] as
              | number
              | null
              | undefined)
          : (entry.value as number | undefined);
        return (
          <div key={String(entry.dataKey)} className="rv-chart-tip-row">
            <span>{entry.name}</span>
            <b>
              {raw == null
                ? "—"
                : entry.dataKey === "balance" || entry.dataKey === "money"
                  ? formatMoney(raw)
                  : raw.toLocaleString("pt-BR")}
            </b>
          </div>
        );
      })}
    </div>
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
          <Chip value="fans" size="xs" color="ink">
            Fãs
          </Chip>
          <Chip value="money" size="xs" color="ink">
            Caixa
          </Chip>
          <Chip value="climate" size="xs" color="ink">
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
                <CartesianGrid stroke={gridStroke} strokeDasharray="1 4" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickMargin={8} />
                <YAxis domain={[0, 100]} tick={axisTick} width={32} />
                <Tooltip
                  content={<TrendTooltip normalized />}
                  cursor={{ stroke: "var(--rv-ink)", strokeDasharray: "1 3" }}
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
                    strokeDasharray="2 3"
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
                <CartesianGrid stroke={gridStroke} strokeDasharray="1 4" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickMargin={8} />
                <YAxis
                  tick={axisTick}
                  width={44}
                  allowDecimals={false}
                  tickFormatter={(v: number) => v.toLocaleString("pt-BR")}
                />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: "var(--rv-ink)", strokeDasharray: "1 3" }} />
                <Area
                  type="monotone"
                  dataKey="fans"
                  name="Fãs"
                  stroke={COLORS.fans}
                  strokeWidth={2}
                  fill={tone(2)}
                  fillOpacity={1}
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
                <CartesianGrid stroke={gridStroke} strokeDasharray="1 4" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickMargin={8} />
                <YAxis
                  tick={axisTick}
                  width={56}
                  tickFormatter={(v: number) => formatMoney(v)}
                />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: "var(--rv-ink)", strokeDasharray: "1 3" }} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Caixa"
                  stroke={COLORS.money}
                  strokeWidth={2}
                  fill={tone(2)}
                  fillOpacity={1}
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
                <CartesianGrid stroke={gridStroke} strokeDasharray="1 4" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickMargin={8} />
                <YAxis domain={[-5, 5]} tick={axisTick} width={32} />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: "var(--rv-ink)", strokeDasharray: "1 3" }} />
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
                  strokeDasharray="2 3"
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
